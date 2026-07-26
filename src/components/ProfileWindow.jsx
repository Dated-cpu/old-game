import { useProfile } from "../managers/ProfileManager"
import AchievementManager from "../managers/AchievementManager"

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatDate(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function ProfileWindow() {
  const profile = useProfile()
  const games = Object.entries(profile.gamesPlayed)
  const unlocked = AchievementManager.getUnlocked(profile)
  const locked = AchievementManager.getLocked(profile)

  return (
    <div className="text-crt-green font-mono text-xs space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="border border-crt-green/30 p-3 space-y-1">
        <p className="text-sm font-bold tracking-wider">NOSTALGIAOS PROFILE</p>
        <p className="text-crt-green/60">Player since {formatDate(profile.firstLaunch)}</p>
      </div>

      {/* Stats */}
      <div className="border border-crt-green/30 p-3">
        <p className="text-crt-green/70 mb-2 text-[10px] tracking-wider uppercase">Statistics</p>
        <div className="grid grid-cols-2 gap-y-1.5">
          <span>Launches</span>
          <span className="text-right">{profile.launchCount}</span>
          <span>Games played</span>
          <span className="text-right">{games.length}</span>
          <span>Total time</span>
          <span className="text-right">{formatTime(profile.totalPlayTime)}</span>
          <span>Memory Points</span>
          <span className="text-right text-crt-green font-bold">{profile.memoryPoints}</span>
        </div>
      </div>

      {/* Game records */}
      {games.length > 0 && (
        <div className="border border-crt-green/30 p-3">
          <p className="text-crt-green/70 mb-2 text-[10px] tracking-wider uppercase">Game Records</p>
          <div className="space-y-1.5">
            {games.map(([id, g]) => (
              <div key={id} className="flex items-center justify-between border-b border-crt-green/10 pb-1">
                <span className="capitalize">{id}</span>
                <span className="text-crt-green/80">
                  Plays: {g.plays} | Best: {g.highScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="border border-crt-green/30 p-3">
        <p className="text-crt-green/70 mb-2 text-[10px] tracking-wider uppercase">
          Achievements ({unlocked.length}/{unlocked.length + locked.length})
        </p>

        {unlocked.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {unlocked.map((ach) => (
              <div key={ach.id} className="flex items-center gap-2 text-crt-green">
                <span>{ach.icon}</span>
                <div>
                  <p className="text-[11px] font-bold">{ach.name}</p>
                  <p className="text-[9px] text-crt-green/60">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {locked.length > 0 && (
          <details className="group">
            <summary className="text-crt-green/50 text-[10px] cursor-pointer hover:text-crt-green/70">
              Locked ({locked.length})
            </summary>
            <div className="space-y-1 mt-2">
              {locked.map((ach) => (
                <div key={ach.id} className="flex items-center gap-2 text-crt-green/40">
                  <span className="opacity-40">{ach.icon}</span>
                  <div>
                    <p className="text-[11px]">{ach.name}</p>
                    <p className="text-[9px] text-crt-green/30">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}
