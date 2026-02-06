import { motion } from 'framer-motion'
import { useState } from 'react'

const ImagePreview = ({ originalImage, processedImage, isProcessing, canvasRef, onReset }) => {
  const [showOriginal, setShowOriginal] = useState(false)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Preview</h2>
        <div className="flex gap-2">
          {processedImage && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOriginal(!showOriginal)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              {showOriginal ? 'Show Result' : 'Show Original'}
            </motion.button>
          )}
          {onReset && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium text-red-700 transition-colors"
            >
              Reset
            </motion.button>
          )}
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-inner">
        {isProcessing ? (
          <div className="aspect-square flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600 font-medium">Detecting shirt area...</p>
            </motion.div>
          </div>
        ) : (
          <motion.img
            key={showOriginal ? 'original' : 'processed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            src={showOriginal && originalImage ? originalImage.src : (processedImage || originalImage?.src)}
            alt="Preview"
            className="w-full h-auto"
            style={{ maxHeight: '600px', objectFit: 'contain' }}
          />
        )}

        {/* Canvas for processing (hidden) */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {processedImage && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl"
        >
          <p className="text-green-700 text-sm font-medium">
            ✨ Color swap complete! Adjust colors or download your image.
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default ImagePreview
