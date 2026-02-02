import { useState, useRef, useEffect } from 'react'

interface AdvancedColorPickerProps {
  value: string // hex color
  onChange: (hex: string) => void
}

type TabType = 'standard' | 'custom'

export function AdvancedColorPicker({ value, onChange }: AdvancedColorPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('standard')
  const [originalColor, setOriginalColor] = useState(value)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(100)
  const [brightness, setBrightness] = useState(100)
  
  const squareRef = useRef<HTMLDivElement>(null)

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
    h = h / 360
    s = s / 100
    v = v / 100
    
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)
    
    let r = 0, g = 0, b = 0
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break
      case 1: r = q; g = v; b = p; break
      case 2: r = p; g = v; b = t; break
      case 3: r = p; g = q; b = v; break
      case 4: r = t; g = p; b = v; break
      case 5: r = v; g = p; b = q; break
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  // Convert Hex to HSV
  const hexToHsv = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let h = 0
    if (diff !== 0) {
      if (max === r) h = 60 * (((g - b) / diff) % 6)
      else if (max === g) h = 60 * (((b - r) / diff) + 2)
      else h = 60 * (((r - g) / diff) + 4)
    }
    if (h < 0) h += 360
    
    const s = max === 0 ? 0 : (diff / max) * 100
    const v = max * 100
    
    return [Math.round(h), Math.round(s), Math.round(v)]
  }

  // Initialize from prop value
  useEffect(() => {
    if (value && /^#[0-9A-Fa-f]{6}$/.test(value)) {
      const [h, s, v] = hexToHsv(value)
      setHue(h)
      setSaturation(s)
      setBrightness(v)
    }
  }, [value])

  // Set original color on mount
  useEffect(() => {
    setOriginalColor(value)
  }, [])

  // Update parent when HSV changes
  useEffect(() => {
    const [r, g, b] = hsvToRgb(hue, saturation, brightness)
    const hex = rgbToHex(r, g, b)
    onChange(hex)
  }, [hue, saturation, brightness, onChange])

  // Handle square gradient click/drag
  const handleSquareInteraction = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!squareRef.current) return
    const rect = squareRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height))
    
    setSaturation(Math.round((x / rect.width) * 100))
    setBrightness(Math.round(100 - (y / rect.height) * 100))
  }

  const handleSquareMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSquareInteraction(e)
    
    const handleMouseMove = (e: MouseEvent) => handleSquareInteraction(e)
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const currentColor = rgbToHex(...hsvToRgb(hue, saturation, brightness))
  const pureHue = rgbToHex(...hsvToRgb(hue, 100, 100))

  return (
    <div className="space-y-4">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('standard')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'standard'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'custom'
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Standard Tab - Hexagonal */}
      {activeTab === 'standard' && (
        <div className="flex gap-6">
          {/* Left: Hexagon + Slider */}
          <div className="flex-1 space-y-4">
            {/* Simplified Hexagonal Representation - Using Circle for now */}
            <div className="relative flex items-center justify-center">
              <div
                className="h-48 w-48 rounded-full cursor-crosshair"
                style={{
                  background: `conic-gradient(
                    hsl(0, 100%, 50%),
                    hsl(60, 100%, 50%),
                    hsl(120, 100%, 50%),
                    hsl(180, 100%, 50%),
                    hsl(240, 100%, 50%),
                    hsl(300, 100%, 50%),
                    hsl(0, 100%, 50%)
                  )`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left - rect.width / 2
                  const y = e.clientY - rect.top - rect.height / 2
                  const angle = Math.atan2(y, x) * (180 / Math.PI)
                  const distance = Math.sqrt(x * x + y * y)
                  const maxDistance = rect.width / 2
                  setHue(Math.round((angle + 360) % 360))
                  setSaturation(Math.min(100, Math.round((distance / maxDistance) * 100)))
                }}
              >
                {/* Pointer */}
                <div
                  className="absolute h-4 w-4 rounded-full border-3 border-white shadow-lg pointer-events-none"
                  style={{
                    left: `calc(50% + ${(saturation / 100) * 96 * Math.cos((hue * Math.PI) / 180)}px - 8px)`,
                    top: `calc(50% + ${(saturation / 100) * 96 * Math.sin((hue * Math.PI) / 180)}px - 8px)`,
                    backgroundColor: currentColor
                  }}
                />
              </div>
            </div>

            {/* Grayscale Slider */}
            <div className="relative h-8 rounded-lg" style={{
              background: 'linear-gradient(to right, #ffffff, #808080, #000000)'
            }}>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="absolute inset-0 w-full cursor-pointer opacity-0"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-3 border-black pointer-events-none shadow-lg"
                style={{
                  left: `calc(${brightness}% - 12px)`,
                  backgroundColor: rgbToHex(...hsvToRgb(0, 0, brightness))
                }}
              />
            </div>
          </div>

          {/* Right: Color Comparison */}
          <div className="w-32 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">New</p>
              <div
                className="h-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md"
                style={{ backgroundColor: currentColor }}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Current</p>
              <div
                className="h-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md"
                style={{ backgroundColor: originalColor }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Tab - Square Picker */}
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Square Gradient */}
            <div className="relative">
              <div
                ref={squareRef}
                onMouseDown={handleSquareMouseDown}
                className="h-48 w-48 cursor-crosshair rounded-lg shadow-xl"
                style={{
                  background: `linear-gradient(to top, #000, transparent),
                              linear-gradient(to right, #fff, ${pureHue})`
                }}
              >
                <div
                  className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
                  style={{
                    left: `${saturation}%`,
                    top: `${100 - brightness}%`,
                    backgroundColor: currentColor
                  }}
                />
              </div>
            </div>

            {/* Brightness Slider */}
            <div className="relative w-6">
              <div
                className="h-48 w-full rounded-lg cursor-pointer"
                style={{
                  background: `linear-gradient(to top, #000, ${pureHue}, #fff)`
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const y = e.clientY - rect.top
                  setBrightness(Math.round(100 - (y / rect.height) * 100))
                }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white pointer-events-none shadow-md"
                  style={{ top: `${100 - brightness}%` }}
                />
              </div>
            </div>

            {/* Color Comparison */}
            <div className="w-24 space-y-2">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">New</p>
                <div
                  className="h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: currentColor }}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Current</p>
                <div
                  className="h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: originalColor }}
                />
              </div>
            </div>
          </div>

          {/* HSL Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hue</label>
              <input
                type="number"
                min="0"
                max="360"
                value={Math.round(hue)}
                onChange={(e) => setHue(Math.max(0, Math.min(360, Number(e.target.value))))}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sat</label>
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(saturation)}
                onChange={(e) => setSaturation(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Lum</label>
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(brightness)}
                onChange={(e) => setBrightness(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* RGB Inputs */}
          <div className="grid grid-cols-3 gap-3">
            {(() => {
              const [r, g, b] = hsvToRgb(hue, saturation, brightness)
              return (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Red</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={r}
                      onChange={(e) => {
                        const newR = Math.max(0, Math.min(255, Number(e.target.value)))
                        const hex = rgbToHex(newR, g, b)
                        const [h, s, v] = hexToHsv(hex)
                        setHue(h)
                        setSaturation(s)
                        setBrightness(v)
                      }}
                      className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Green</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={g}
                      onChange={(e) => {
                        const newG = Math.max(0, Math.min(255, Number(e.target.value)))
                        const hex = rgbToHex(r, newG, b)
                        const [h, s, v] = hexToHsv(hex)
                        setHue(h)
                        setSaturation(s)
                        setBrightness(v)
                      }}
                      className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Blue</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={b}
                      onChange={(e) => {
                        const newB = Math.max(0, Math.min(255, Number(e.target.value)))
                        const hex = rgbToHex(r, g, newB)
                        const [h, s, v] = hexToHsv(hex)
                        setHue(h)
                        setSaturation(s)
                        setBrightness(v)
                      }}
                      className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )
            })()}
          </div>

          {/* Hex Input */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"># Hex</label>
            <input
              type="text"
              value={currentColor.replace('#', '')}
              onChange={(e) => {
                const hex = '#' + e.target.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6)
                if (/^#[a-fA-F0-9]{6}$/.test(hex)) {
                  const [h, s, v] = hexToHsv(hex)
                  setHue(h)
                  setSaturation(s)
                  setBrightness(v)
                }
              }}
              maxLength={6}
              className="w-full px-3 py-2 font-mono text-sm font-semibold uppercase rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="5780FF"
            />
          </div>
        </div>
      )}
    </div>
  )
}
