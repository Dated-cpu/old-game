import { useState, useEffect } from "react"

const bootLines = [
  { text: "NostalgiaOS v1.0 Bootloader", delay: 300 },
  { text: "CPU: Zilog Z80 @ 4.19 MHz", delay: 200 },
  { text: "Memory: 64KB OK", delay: 400 },
  { text: "Video: DMG-CPU @ 2.6 MHz", delay: 300 },
  { text: "PPU: 160x144 LCD (4 shades)", delay: 300 },
  { text: "Audio: 4-channel PSG", delay: 200 },
  { text: "Cartridge: 32MB OK", delay: 500 },
  { text: "", delay: 200 },
  { text: "Starting NostalgiaOS...", delay: 100 },
]

export default function BootScreen({ onBootComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [bootProgress, setBootProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let lineIndex = 0

    const showNextLine = () => {
      if (cancelled || lineIndex >= bootLines.length) {
        setShowProgress(true)
        return
      }

      setVisibleLines((prev) => [...prev, bootLines[lineIndex].text])
      const delay = bootLines[lineIndex].delay

      if (bootLines[lineIndex].text === "Starting NostalgiaOS...") {
        setShowProgress(true)
        lineIndex++
        return
      }

      lineIndex++
      setTimeout(showNextLine, delay)
    }

    setTimeout(showNextLine, 500)

    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!showProgress) return

    let cancelled = false

    const timer = setTimeout(() => {
      if (cancelled) return
      setBootProgress(100)
      setTimeout(() => {
        if (!cancelled) setReady(true)
      }, 600)
    }, 2200)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [showProgress])

  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(onBootComplete, 800)
    return () => clearTimeout(timer)
  }, [ready, onBootComplete])

  return (
    <div className="fixed inset-0 bg-crt-dark flex flex-col items-center justify-center crt-flicker scanlines">
      <div className="w-full max-w-2xl px-8">
        <div className="text-crt-green font-mono text-sm leading-relaxed">
          {visibleLines.map((line, i) => (
            <p key={i} className="typewriter">
              {line}
              {i === visibleLines.length - 1 && <span className="cursor-blink">_</span>}
            </p>
          ))}

          {showProgress && (
            <div className="mt-6 border border-crt-green/50 p-1 w-80">
              <div
                className="h-4 bg-crt-green transition-all duration-300 ease-linear"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
          )}

          {ready && (
            <p className="mt-4 text-crt-green animate-pulse">
              System ready. Loading desktop...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
