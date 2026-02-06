import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const ImageUpload = ({ onImageUpload }) => {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      onImageUpload(file)
    } else {
      alert('Please upload a JPG, PNG, or WEBP image')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-105' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }
        `}
      >
        <motion.div
          animate={{ y: isDragging ? -5 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {isDragging ? 'Drop your image here' : 'Drag & Drop your image'}
          </h3>
          <p className="text-gray-500 mb-4">or click to browse</p>
          <p className="text-sm text-gray-400">
            Supports: JPG, PNG, WEBP
          </p>
        </motion.div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />
    </motion.div>
  )
}

export default ImageUpload
