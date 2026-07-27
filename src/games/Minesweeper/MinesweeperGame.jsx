import { useState, useEffect, useRef, useCallback } from "react"
import ProfileManager from "../../managers/ProfileManager"
import AchievementManager from "../../managers/AchievementManager"

const DIFFICULTIES = {
  easy: { rows: 9, cols: 9, mines: 10, label: "Easy", cellSize: 28 },
  medium: { rows: 16, cols: 16, mines: 40, label: "Medium", cellSize: 24 },
  hard: { rows: 16, cols: 30, mines: 99, label: "Hard", cellSize: 20 },
}

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

function createEmptyBoard(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  )
}

function placeMines(board, rows, cols, mines, safeR, safeC) {
  const safe = new Set()
  safe.add(`${safeR},${safeC}`)
  for (const [dr, dc] of DIRS) {
    const nr = safeR + dr
    const nc = safeC + dc
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      safe.add(`${nr},${nc}`)
    }
  }

  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (safe.has(`${r},${c}`) || board[r][c].mine) continue
    board[r][c].mine = true
    placed++
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue
      let count = 0
      for (const [dr, dc] of DIRS) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
          count++
        }
      }
      board[r][c].adjacent = count
    }
  }
}

function floodReveal(board, rows, cols, r, c) {
  const stack = [[r, c]]
  while (stack.length) {
    const [cr, cc] = stack.pop()
    const cell = board[cr][cc]
    if (cell.revealed || cell.flagged) continue
    cell.revealed = true
    if (cell.adjacent === 0 && !cell.mine) {
      for (const [dr, dc] of DIRS) {
        const nr = cr + dr
        const nc = cc + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          stack.push([nr, nc])
        }
      }
    }
  }
}

function countFlags(board) {
  let count = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.flagged) count++
    }
  }
  return count
}

function checkWin(board, rows, cols, totalMines) {
  let revealed = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell.revealed) revealed++
    }
  }
  return revealed === rows * cols - totalMines
}

function formatTimer(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0")
  const s = String(sec % 60).padStart(2, "0")
  return `${m}:${s}`
}

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState(() => {
    const profile = ProfileManager.init()
    return profile.gameData?.minesweeper?.difficulty || "easy"
  })
  const [board, setBoard] = useState(() => {
    const { rows, cols } = DIFFICULTIES.easy
    return createEmptyBoard(rows, cols)
  })
  const [gameStatus, setGameStatus] = useState("idle")
  const [timer, setTimer] = useState(0)
  const [flagCount, setFlagCount] = useState(0)
  const [bestTimes, setBestTimes] = useState(() => {
    const profile = ProfileManager.init()
    return profile.gameData?.minesweeper?.bestTimes || {}
  })
  const [firstMove, setFirstMove] = useState(true)
  const statusRef = useRef(gameStatus)
  const boardRef = useRef(board)
  const timerRef = useRef(timer)
  const firstMoveRef = useRef(firstMove)
  const settings = DIFFICULTIES[difficulty]

  useEffect(() => { statusRef.current = gameStatus }, [gameStatus])
  useEffect(() => { boardRef.current = board }, [board])
  useEffect(() => { timerRef.current = timer }, [timer])
  useEffect(() => { firstMoveRef.current = firstMove }, [firstMove])

  useEffect(() => {
    if (gameStatus !== "playing") return
    const interval = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [gameStatus])

  const initGame = useCallback((diff) => {
    const s = DIFFICULTIES[diff]
    setBoard(createEmptyBoard(s.rows, s.cols))
    setGameStatus("idle")
    setTimer(0)
    setFlagCount(0)
    setFirstMove(true)
    setDifficulty(diff)
    ProfileManager.updateGameData("minesweeper", { difficulty: diff })
  }, [])

  const reveal = useCallback((r, c) => {
    const cur = boardRef.current
    const cell = cur[r][c]
    if (cell.revealed || cell.flagged) return
    if (statusRef.current === "won" || statusRef.current === "lost") return

    if (firstMoveRef.current) {
      const { rows, cols, mines } = DIFFICULTIES[difficulty]
      const newBoard = createEmptyBoard(rows, cols)
      placeMines(newBoard, rows, cols, mines, r, c)
      floodReveal(newBoard, rows, cols, r, c)
      const fc = countFlags(newBoard)
      setBoard(newBoard)
      setFlagCount(fc)
      setFirstMove(false)
      setGameStatus("playing")

      if (checkWin(newBoard, rows, cols, mines)) {
        setGameStatus("won")
      }
      return
    }

    if (cell.mine) {
      const fb = cur.map((row) =>
        row.map((c) => ({
          ...c,
          revealed: c.mine ? true : c.revealed,
        }))
      )
      setBoard(fb)
      setGameStatus("lost")
      return
    }

    const newBoard = cur.map((row) => row.map((c) => ({ ...c })))
    floodReveal(newBoard, settings.rows, settings.cols, r, c)
    const fc = countFlags(newBoard)
    setBoard(newBoard)
    setFlagCount(fc)

    if (checkWin(newBoard, settings.rows, settings.cols, settings.mines)) {
      setGameStatus("won")
    }
  }, [difficulty, settings])

  const toggleFlag = useCallback((r, c, e) => {
    e.preventDefault()
    const cur = boardRef.current
    const cell = cur[r][c]
    if (cell.revealed) return
    if (statusRef.current === "won" || statusRef.current === "lost") return
    if (firstMoveRef.current) return

    const newBoard = cur.map((row) => row.map((c) => ({ ...c })))
    newBoard[r][c].flagged = !newBoard[r][c].flagged
    const fc = countFlags(newBoard)
    setBoard(newBoard)
    setFlagCount(fc)
  }, [])

  const chord = useCallback((r, c) => {
    const cur = boardRef.current
    const cell = cur[r][c]
    if (!cell.revealed || cell.adjacent === 0) return
    if (statusRef.current !== "playing") return

    let adjFlags = 0
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (
        nr >= 0 && nr < settings.rows &&
        nc >= 0 && nc < settings.cols &&
        cur[nr][nc].flagged
      ) {
        adjFlags++
      }
    }
    if (adjFlags !== cell.adjacent) return

    const newBoard = cur.map((row) => row.map((c) => ({ ...c })))
    let hitMine = false
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (
        nr >= 0 && nr < settings.rows &&
        nc >= 0 && nc < settings.cols &&
        !newBoard[nr][nc].revealed &&
        !newBoard[nr][nc].flagged
      ) {
        if (newBoard[nr][nc].mine) {
          hitMine = true
        } else {
          floodReveal(newBoard, settings.rows, settings.cols, nr, nc)
        }
      }
    }
    if (hitMine) {
      const fb = newBoard.map((row) =>
        row.map((c) => ({
          ...c,
          revealed: c.mine ? true : c.revealed,
        }))
      )
      setBoard(fb)
      setGameStatus("lost")
      return
    }
    const fc = countFlags(newBoard)
    setBoard(newBoard)
    setFlagCount(fc)
    if (checkWin(newBoard, settings.rows, settings.cols, settings.mines)) {
      setGameStatus("won")
    }
  }, [settings])

  useEffect(() => {
    if (gameStatus !== "won") return
    const { mines } = settings

    ProfileManager.recordGamePlayed("minesweeper", Math.max(1, 1000 - timer * 10))

    const profile = ProfileManager.get()
    AchievementManager.checkAndAward(profile)

    ProfileManager.updateGameData("minesweeper", {
      bestTimes: {
        ...bestTimes,
        [difficulty]: bestTimes[difficulty]
          ? Math.min(bestTimes[difficulty], timer)
          : timer,
      },
    })
    setBestTimes((prev) => ({
      ...prev,
      [difficulty]: prev[difficulty]
        ? Math.min(prev[difficulty], timer)
        : timer,
    }))

    const mpAward = Math.max(10, Math.floor(100 / timer) * 10 + 20)
    ProfileManager.addMemoryPoints(mpAward)

    const newAchs = AchievementManager.checkAndAward(ProfileManager.get())
    if (newAchs.length > 0) {
      ProfileManager.addMemoryPoints(newAchs.length * 50)
    }
  }, [gameStatus, timer, difficulty, settings])

  useEffect(() => {
    if (gameStatus !== "lost") return
    ProfileManager.recordGamePlayed("minesweeper", 0)
  }, [gameStatus])

  const minesLeft = settings.mines - flagCount
  const isIdle = gameStatus === "idle"

  const getCellContent = (cell) => {
    if (cell.revealed) {
      if (cell.mine) return "💣"
      if (cell.adjacent === 0) return ""
      return cell.adjacent
    }
    if (cell.flagged) return "🚩"
    return ""
  }

  const getCellStyle = (cell) => {
    if (cell.revealed) {
      if (cell.mine) return "bg-crt-bg"
      return "bg-crt-bg"
    }
    if (cell.flagged) return "bg-retro-dark"
    return "bg-retro-dark hover:bg-crt-green/10"
  }

  const getNumberColor = (n) => {
    const colors = [
      "",
      "text-crt-green",
      "text-crt-amber",
      "text-crt-blue",
      "text-crt-green/70",
      "text-crt-amber/70",
      "text-crt-blue/70",
      "text-crt-white",
      "text-crt-white/70",
    ]
    return colors[n] || "text-crt-green"
  }

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Header: difficulty + stats */}
      <div className="flex items-center gap-2 font-mono text-[10px] text-crt-green flex-wrap justify-center">
        {(Object.entries(DIFFICULTIES)).map(([key, d]) => (
          <button
            key={key}
            onClick={() => initGame(key)}
            className={`px-2 py-0.5 border cursor-pointer ${
              difficulty === key
                ? "border-crt-green bg-crt-green/10 text-crt-green"
                : "border-crt-green/30 text-crt-green/60 hover:border-crt-green/60"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between w-full font-mono text-xs text-crt-green border border-crt-green/30 px-3 py-1">
        <span>💣 {String(Math.max(0, minesLeft)).padStart(3, "0")}</span>
        <span className="text-[9px] text-crt-green/50">
          {gameStatus === "won" ? "YOU WIN!" : gameStatus === "lost" ? "GAME OVER" : isIdle ? "Click to start" : formatTimer(timer)}
        </span>
        <span>⏱ {formatTimer(timer)}</span>
      </div>

      {/* Best time */}
      {bestTimes[difficulty] != null && (
        <p className="font-mono text-[9px] text-crt-green/50">
          Best: {formatTimer(bestTimes[difficulty])}
        </p>
      )}

      {/* Board */}
      <div
        className="border border-crt-green/30"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${settings.cols}, ${settings.cellSize}px)`,
          gridTemplateRows: `repeat(${settings.rows}, ${settings.cellSize}px)`,
        }}
      >
        {board.flat().map((cell, i) => {
          const r = Math.floor(i / settings.cols)
          const c = i % settings.cols
          const content = getCellContent(cell)
          const isNumber = cell.revealed && !cell.mine && cell.adjacent > 0
          const showWrong = gameStatus === "lost" && cell.flagged && !cell.mine

          return (
            <div
              key={i}
              onClick={() => reveal(r, c)}
              onDoubleClick={() => chord(r, c)}
              onContextMenu={(e) => toggleFlag(r, c, e)}
              className={`
                flex items-center justify-center text-xs font-bold cursor-pointer border border-crt-green/10
                ${getCellStyle(cell)}
                ${isNumber ? getNumberColor(cell.adjacent) : "text-crt-green"}
                ${gameStatus !== "playing" && gameStatus !== "idle" ? "cursor-default" : ""}
              `}
              style={{
                width: settings.cellSize,
                height: settings.cellSize,
                fontSize: settings.cellSize >= 24 ? 12 : 10,
              }}
            >
              {showWrong ? "❌" : content}
            </div>
          )
        })}
      </div>

      {/* Restart */}
      {(gameStatus === "won" || gameStatus === "lost") && (
        <button
          onClick={() => initGame(difficulty)}
          className="border border-crt-green/40 px-4 py-1 text-xs font-mono text-crt-green hover:bg-crt-green/10 cursor-pointer"
        >
          {gameStatus === "won" ? "PLAY AGAIN" : "TRY AGAIN"}
        </button>
      )}
    </div>
  )
}
