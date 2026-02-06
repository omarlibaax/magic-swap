import { motion } from 'framer-motion'

const ColorPicker = ({ presetColors, selectedColor, onColorChange }) => {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Choose a Color
      </h2>

      {/* Preset Colors */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Preset Colors</h3>
        <div className="grid grid-cols-3 gap-3">
          {presetColors.map((color) => (
            <motion.button
              key={color.value}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onColorChange(color.value)}
              className={`
                aspect-square rounded-xl shadow-md transition-all duration-300
                ${selectedColor === color.value 
                  ? 'ring-4 ring-indigo-500 ring-offset-2 scale-110' 
                  : 'hover:shadow-lg'
                }
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {selectedColor === color.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-white text-2xl"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Custom Color</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-20 h-20 rounded-xl cursor-pointer border-2 border-gray-200"
          />
          <div className="flex-1">
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="#4f46e5"
            />
          </div>
        </div>
      </div>

      {/* Selected Color Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-4 rounded-xl"
        style={{
          backgroundColor: selectedColor,
          boxShadow: `0 10px 30px ${selectedColor}40`,
        }}
      >
        <p className="text-white font-semibold text-center">
          Selected: {selectedColor.toUpperCase()}
        </p>
      </motion.div>
    </div>
  )
}

export default ColorPicker
