import { useState, useEffect } from "react"
import GameWindow from "./GameWindow"
import { useProfile } from "../managers/ProfileManager"

const games = [
  { id: "tetris", name: "Tetris", icon: "🎮" },
  { id: "snake", name: "Snake", icon: "🐍" },
  { id: "minesweeper", name: "Minesweeper", icon: "💣" },
  { id: "pong", name: "Pong", icon: "🏓" },
  { id: "mario", name: "Super Mario", icon: "🍄" },
  { id: "pacman", name: "Pac-Man", icon: "👾" },
  { id: "dino", name: "T-Rex Run", icon: "🦖" },
  { id: "invaders", name: "Space Invaders", icon: "👽" },
  { id: "zelda", name: "Zelda", icon: "⚔️" },
  { id: "profile", name: "Profile", icon: "👤", system: true },
]

export default function Desktop() {
  const profile = useProfile()
  const [clock, setClock] = useState(new Date())
  const [activeGame, setActiveGame] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleGameClose = () => {
    setActiveGame(null)
  }

  const time = clock.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  const date = clock.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="fixed inset-0 bg-crt-dark crt-flicker scanlines flex flex-col">
      {/* Taskbar */}
      <div className="bg-retro-dark border-b-2 border-crt-green/30 px-4 py-1 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-crt-green text-lg">◉</span>
          <span className="text-crt-white text-xs font-mono tracking-wider">
            NostalgiaOS
          </span>
        </div>
        <div className="text-crt-green/70 text-xs font-mono text-right">
          <div>{time}</div>
          <div className="text-[10px]">{date}</div>
        </div>
      </div>

      {/* Desktop area with icons */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game)}
              className="group flex flex-col items-center gap-2 p-4 rounded border border-transparent hover:border-crt-green/40 hover:bg-crt-green/5 transition-all cursor-pointer"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">
                {game.icon}
              </span>
              <span className="text-crt-white/80 text-xs font-mono text-center leading-tight">
                {game.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-retro-dark border-t-2 border-crt-green/30 px-4 py-1 shrink-0 flex items-center justify-between">
        <p className="text-crt-green/50 text-[10px] font-mono">
          NostalgiaOS v1.0 | {profile ? `${Object.keys(profile.gamesPlayed).length} games played` : ""}
        </p>
        <p className="text-crt-green/60 text-[10px] font-mono">
          MP: {profile?.memoryPoints ?? 0}
        </p>
      </div>

      {activeGame && (
        <GameWindow game={activeGame} onClose={handleGameClose} />
      )}
    </div>
  )
}
