import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ImageUpload from './components/ImageUpload'
import ColorPicker from './components/ColorPicker'
import ImagePreview from './components/ImagePreview'
import './App.css'

const PRESET_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#fbbf24' },
]

function App() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [selectedColor, setSelectedColor] = useState('#4f46e5')
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shirtMask, setShirtMask] = useState(null)
  const canvasRef = useRef(null)
  const originalImageRef = useRef(null)

  const handleImageUpload = (imageFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setUploadedImage(img)
        originalImageRef.current = img
        setProcessedImage(null)
        setShirtMask(null)
        detectShirt(img)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(imageFile)
  }

  const detectShirt = (img) => {
    setIsProcessing(true)
    
    // Simulate AI detection delay
    setTimeout(() => {
      // Enhanced detection: analyze image to find shirt area
      // In production, you'd use TensorFlow.js or MediaPipe here
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const mask = new Uint8ClampedArray(imageData.data.length / 4)
      
      // Analyze center-upper region to find dominant colors (likely shirt)
      const sampleRegion = {
        x: canvas.width * 0.25,
        y: canvas.height * 0.15,
        width: canvas.width * 0.5,
        height: canvas.height * 0.4
      }
      
      // Collect color samples from the likely shirt area
      const colorSamples = []
      for (let y = sampleRegion.y; y < sampleRegion.y + sampleRegion.height; y += 5) {
        for (let x = sampleRegion.x; x < sampleRegion.x + sampleRegion.width; x += 5) {
          const idx = (y * canvas.width + x) * 4
          colorSamples.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2]
          })
        }
      }
      
      // Find average color (shirt color)
      const avgColor = colorSamples.reduce((acc, c) => ({
        r: acc.r + c.r,
        g: acc.g + c.g,
        b: acc.b + c.b
      }), { r: 0, g: 0, b: 0 })
      avgColor.r /= colorSamples.length
      avgColor.g /= colorSamples.length
      avgColor.b /= colorSamples.length
      
      // Create mask based on color similarity and position
      for (let i = 0; i < mask.length; i++) {
        const x = i % canvas.width
        const y = Math.floor(i / canvas.width)
        const idx = i * 4
        
        const pixelR = data[idx]
        const pixelG = data[idx + 1]
        const pixelB = data[idx + 2]
        
        // Calculate color distance
        const colorDist = Math.sqrt(
          Math.pow(pixelR - avgColor.r, 2) +
          Math.pow(pixelG - avgColor.g, 2) +
          Math.pow(pixelB - avgColor.b, 2)
        )
        
        // Position-based weighting (shirt is typically in upper-center)
        const centerX = canvas.width / 2
        const centerY = canvas.height * 0.25
        const posDist = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        )
        const maxPosDist = Math.min(canvas.width, canvas.height) * 0.35
        
        // Combine color similarity and position
        const colorMatch = Math.max(0, 1 - colorDist / 100) // Normalize to 0-1
        const posMatch = Math.max(0, 1 - posDist / maxPosDist)
        const yMatch = y < canvas.height * 0.65 ? 1 : Math.max(0, 1 - (y - canvas.height * 0.65) / (canvas.height * 0.2))
        
        // Weighted combination
        const confidence = (colorMatch * 0.5 + posMatch * 0.3 + yMatch * 0.2)
        mask[i] = Math.min(255, Math.max(0, confidence * 255))
      }
      
      setShirtMask(mask)
      setIsProcessing(false)
      applyColorChange(img, mask, selectedColor)
    }, 800)
  }

  const applyColorChange = (img, mask, color) => {
    if (!img || !mask) return

    // Create canvas if ref doesn't exist
    let canvas = canvasRef.current
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvasRef.current = canvas
    }
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    
    // Draw original image
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Parse color (handle both 3 and 6 digit hex)
    let hex = color.replace('#', '')
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('')
    }
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Apply color change with blend mode
    for (let i = 0; i < data.length; i += 4) {
      const maskIndex = i / 4
      const maskValue = mask[maskIndex] / 255
      
      if (maskValue > 0) {
        // Get original pixel
        const origR = data[i]
        const origG = data[i + 1]
        const origB = data[i + 2]
        
        // Preserve texture and shadows using luminance-based blending
        const luminance = 0.299 * origR + 0.587 * origG + 0.114 * origB
        const normalizedLum = luminance / 255
        
        // Use overlay blend mode for more natural color replacement
        const overlay = (base, blend) => {
          return base < 128 
            ? (2 * base * blend) / 255
            : 255 - (2 * (255 - base) * (255 - blend)) / 255
        }
        
        // Apply overlay blend
        const newR = overlay(origR, r)
        const newG = overlay(origG, g)
        const newB = overlay(origB, b)
        
        // Blend with original based on mask and preserve highlights/shadows
        const intensity = maskValue * 0.8 // 80% color change
        const shadowPreserve = Math.min(1, normalizedLum * 1.5) // Preserve more in shadows
        
        data[i] = newR * intensity * shadowPreserve + origR * (1 - intensity * shadowPreserve)
        data[i + 1] = newG * intensity * shadowPreserve + origG * (1 - intensity * shadowPreserve)
        data[i + 2] = newB * intensity * shadowPreserve + origB * (1 - intensity * shadowPreserve)
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
    setProcessedImage(canvas.toDataURL('image/png'))
  }

  useEffect(() => {
    if (uploadedImage && shirtMask) {
      applyColorChange(uploadedImage, shirtMask, selectedColor)
    }
  }, [selectedColor, uploadedImage, shirtMask])

  const handleDownload = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.download = 'magic-swap-shirt.png'
    link.href = processedImage
    link.click()
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          🎨 Magic Shirt Color Swap
        </motion.h1>
        <p className="text-center text-gray-600 mb-8">
          Upload a photo and change shirt colors instantly
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            {!uploadedImage ? (
              <ImageUpload onImageUpload={handleImageUpload} />
            ) : (
              <ImagePreview
                originalImage={uploadedImage}
                processedImage={processedImage}
                isProcessing={isProcessing}
                canvasRef={canvasRef}
                onReset={() => {
                  setUploadedImage(null)
                  setProcessedImage(null)
                  setShirtMask(null)
                  originalImageRef.current = null
                }}
              />
            )}
          </motion.div>

          {/* Right: Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <ColorPicker
              presetColors={PRESET_COLORS}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />

            {processedImage && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                📥 Download Image
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default App
