import { useState, useEffect, useRef, useCallback } from "react"
import ProfileManager from "../../managers/ProfileManager"

const GRID = 20
const INIT_SPEED = 160

function randomFood(snake) {
  const occupied = new Set(snake.map((c) => `${c.x},${c.y}`))
  let pos
  do {
    pos = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    }
  } while (occupied.has(`${pos.x},${pos.y}`))
  return pos
}

const DIR = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(() => [{ x: 10, y: 10 }])
  const [food, setFood] = useState(() => ({ x: 15, y: 10 }))
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    const profile = ProfileManager.init()
    return profile.gamesPlayed.snake?.highScore || 0
  })
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)

  const dirRef = useRef(direction)
  const snakeRef = useRef(snake)
  const foodRef = useRef(food)
  const scoreRef = useRef(score)
  const gameOverRef = useRef(gameOver)

  useEffect(() => { dirRef.current = direction }, [direction])
  useEffect(() => { snakeRef.current = snake }, [snake])
  useEffect(() => { foodRef.current = food }, [food])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { gameOverRef.current = gameOver }, [gameOver])

  const handleKey = useCallback((e) => {
    if (e.key.startsWith("Arrow")) {
      e.preventDefault()
    }

    if (e.key === "p" || e.key === "P") {
      setPaused((p) => !p)
      return
    }

    const newDir = DIR[e.key]
    if (!newDir) return
    if (gameOverRef.current) return
    const current = dirRef.current
    if (current.x + newDir.x === 0 && current.y + newDir.y === 0) return
    setDirection(newDir)
  }, [])

  useEffect(() => {
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleKey])

  useEffect(() => {
    if (gameOver || paused) return

    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0]
        const dir = dirRef.current
        const newHead = { x: head.x + dir.x, y: head.y + dir.y }

        if (
          newHead.x < 0 || newHead.x >= GRID ||
          newHead.y < 0 || newHead.y >= GRID ||
          prev.some((seg) => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true)
          return prev
        }

        const ate = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y
        const newSnake = [newHead, ...prev]
        if (!ate) newSnake.pop()

        if (ate) {
          setScore((s) => {
            const next = s + 1
            setFood(randomFood(newSnake))
            return next
          })
        }

        return newSnake
      })
    }, INIT_SPEED)

    return () => clearInterval(interval)
  }, [gameOver, paused])

  useEffect(() => {
    if (gameOver) {
      ProfileManager.recordGamePlayed("snake", score)
      if (score > highScore) {
        setHighScore(score)
      }
    }
  }, [gameOver, score, highScore])

  const restart = () => {
    const start = [{ x: 10, y: 10 }]
    setSnake(start)
    setFood(randomFood(start))
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setGameOver(false)
    setPaused(false)
  }

  const snakeSet = new Set(snake.map((c) => `${c.x},${c.y}`))

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Scoreboard */}
      <div className="flex items-center justify-between w-full font-mono text-xs text-crt-green">
        <span>SCORE: {String(score).padStart(3, "0")}</span>
        <span>HI: {String(highScore).padStart(3, "0")}</span>
      </div>

      {/* Game grid */}
      <div
        className="grid border border-crt-green/30"
        style={{
          gridTemplateColumns: `repeat(${GRID}, 16px)`,
          gridTemplateRows: `repeat(${GRID}, 16px)`,
        }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const x = i % GRID
          const y = Math.floor(i / GRID)
          const isHead = snake[0].x === x && snake[0].y === y
          const isBody = !isHead && snakeSet.has(`${x},${y}`)
          const isFood = food.x === x && food.y === y

          return (
            <div
              key={i}
              className={
                isHead
                  ? "bg-crt-green"
                  : isBody
                    ? "bg-crt-green/60"
                    : isFood
                      ? "bg-crt-green/90"
                      : "bg-crt-dark"
              }
              style={{
                width: 16,
                height: 16,
                boxShadow: isHead ? "0 0 4px #33ff33" : "none",
              }}
            />
          )
        })}
      </div>

      {/* Controls / Status */}
      <div className="font-mono text-xs text-crt-green/60 text-center">
        {gameOver ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-crt-green font-bold text-sm">GAME OVER</span>
            <button
              onClick={restart}
              className="border border-crt-green/40 px-4 py-1 text-crt-green hover:bg-crt-green/10 cursor-pointer"
            >
              RESTART
            </button>
          </div>
        ) : paused ? (
          <span className="animate-pulse">PAUSED [P]</span>
        ) : (
          <span>↑ ↓ ← → | [P] pause</span>
        )}
      </div>
    </div>
  )
}
