function getBackgroundColor(title) {
  if (!title || typeof title !== 'string') return '#cccccc'
  const charCode = title.charCodeAt(0)
  const r = charCode % 256
  const g = (charCode * 13) % 256
  const b = (charCode * 29) % 256
  return `rgb(${r}, ${g}, ${b})`
}

function getTextColor(bgColor) {
  const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
    const g = parseInt(rgbMatch[2])
    const b = parseInt(rgbMatch[3])

    const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return brightness > 0.6 ? '#2c3e50' : '#ffffff'
  }
  return '#2c3e50'
}

export {
  getBackgroundColor,
  getTextColor
}
