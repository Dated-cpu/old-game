import { useState, useEffect, useRef } from "react"
import ProfileWindow from "./ProfileWindow"
import ProfileManager from "../managers/ProfileManager"
import AchievementManager from "../managers/AchievementManager"
import { gameRegistry } from "../games/registry"

function getWindowWidth(game) {
  if (game.system) return "max-w-md"
  if (game.id === "minesweeper") return "max-w-2xl"
  if (game.id === "snake") return "max-w-sm"
  return "max-w-md"
}

function getContentPadding(game) {
  if (game.system) return "p-6"
  if (game.id === "minesweeper") return "p-3"
  if (game.id === "snake") return "p-4"
  return "p-6 min-h-[160px]"
}

export default function GameWindow({ game, onClose }) {
  const [phase, setPhase] = useState(() => (game.system ? "ready" : "booting"))
  const [dots, setDots] = useState("")
  const startTime = useRef(null)

  const GameComponent = gameRegistry[game.id]

  useEffect(() => {
    if (game.system) return

    let cancelled = false

    const steps = [
      { to: "exe", delay: 600 },
      { to: "loading", delay: 800 },
      { to: "ready", delay: 2000 },
    ]

    let i = 0
    const run = () => {
      if (cancelled || i >= steps.length) return
      const step = steps[i]
      setTimeout(() => {
        if (cancelled) return
        setPhase(step.to)
        i++
        run()
      }, step.delay)
    }

    run()
    return () => { cancelled = true }
  }, [game.system])

  useEffect(() => {
    if (phase !== "loading") return
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 5 ? "" : prev + "."))
    }, 400)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase === "ready" && !game.system) {
      startTime.current = Date.now()
    }
  }, [phase, game.system])

  const handleClose = () => {
    if (startTime.current && !game.system) {
      const elapsed = Math.round((Date.now() - startTime.current) / 1000)
      if (elapsed > 0) {
        ProfileManager.addPlayTime(elapsed)
        ProfileManager.addMemoryPoints(Math.floor(elapsed / 30))
      }

      const profile = ProfileManager.get()
      const newAchs = AchievementManager.checkAndAward(profile)
      if (newAchs.length > 0) {
        ProfileManager.addMemoryPoints(newAchs.length * 50)
      }
    }
    onClose()
  }

  const exeName = game.name.toLowerCase().replace(/\s+/g, "") + ".exe"

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />

      <div className={`relative w-full ${getWindowWidth(game)} border-2 border-crt-green/40 bg-crt-bg shadow-[0_0_20px_rgba(51,255,51,0.15)]`}>
        {/* Title bar */}
        <div className="flex items-center justify-between bg-gradient-to-r from-crt-green/20 to-crt-green/10 border-b border-crt-green/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{game.icon}</span>
            <span className="text-crt-green text-sm font-mono tracking-wide">
              {game.name}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-crt-dark bg-crt-green hover:bg-crt-green/80 px-2 py-0.5 text-xs font-mono font-bold leading-none cursor-pointer"
          >
            X
          </button>
        </div>

        {/* Body */}
        <div className={`flex flex-col justify-center ${getContentPadding(game)}`}>
          {game.system ? (
            <ProfileWindow />
          ) : GameComponent && phase === "ready" ? (
            <GameComponent />
          ) : (
            <div className="text-crt-green font-mono text-sm space-y-2">
              {phase === "booting" && (
                <p className="typewriter">
                  {exeName}
                  <span className="cursor-blink">_</span>
                </p>
              )}

              {phase === "exe" && (
                <>
                  <p className="typewriter">
                    {exeName}
                  </p>
                  <p className="animate-pulse mt-2">
                    Initializing...
                  </p>
                </>
              )}

              {phase === "loading" && (
                <>
                  <p className="text-crt-green/60">
                    {exeName}
                  </p>
                  <p className="mt-2">
                    Loading{dots}
                  </p>
                </>
              )}

              {phase === "ready" && (
                <>
                  <p className="text-crt-green/60">
                    {exeName}
                  </p>
                  <p className="mt-3 text-crt-green font-bold">
                    Ready.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="border-t border-crt-green/20 px-3 py-1">
          <p className="text-crt-green/40 text-[10px] font-mono">
            {phase === "ready" ? "Click X to close" : "Running..."}
          </p>
        </div>
      </div>
    </div>
  )
}
