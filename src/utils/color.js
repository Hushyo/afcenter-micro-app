function getBackgroundColor(title) {
  if (!title || typeof title !== 'string') return '#cccccc'
  const charCode = title.charCodeAt(0)
  // 直接用字符编码生成 RGB 分量
  const r = charCode % 256					// 红: 0-255
  const g = (charCode * 13) % 256		// 绿: 0-255
  const b = (charCode * 29) % 256		// 蓝: 0-255
  return `rgb(${r}, ${g}, ${b})`
}

function getTextColor(bgColor) {
  // 解析 RGB 值
  const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1])
    const g = parseInt(rgbMatch[2])
    const b = parseInt(rgbMatch[3])
    // 计算相对亮度
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    // 根据亮度决定文字颜色
    return luminance > 0.6 ? '#2c3e50' : '#ffffff'
  }
  return '#2c3e50'
}

export {
  getBackgroundColor,
  getTextColor
}
