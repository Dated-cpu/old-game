import ProfileManager from "./ProfileManager"

const ACHIEVEMENTS = [
  {
    id: "first_game",
    name: "First Steps",
    desc: "Play your first game",
    icon: "🎯",
    check: (p) => Object.keys(p.gamesPlayed).length >= 1,
  },
  {
    id: "snake_10",
    name: "Appetizer",
    desc: "Score 10 in Snake",
    icon: "🐍",
    check: (p) => (p.gamesPlayed.snake?.highScore || 0) >= 10,
  },
  {
    id: "snake_30",
    name: "Hungry Python",
    desc: "Score 30 in Snake",
    icon: "🐉",
    check: (p) => (p.gamesPlayed.snake?.highScore || 0) >= 30,
  },
  {
    id: "snake_50",
    name: "Snake Charmer",
    desc: "Score 50 in Snake",
    icon: "👑",
    check: (p) => (p.gamesPlayed.snake?.highScore || 0) >= 50,
  },
  {
    id: "dedicated",
    name: "Dedicated Player",
    desc: "Launch the OS 10 times",
    icon: "⭐",
    check: (p) => p.launchCount >= 10,
  },
  {
    id: "veteran",
    name: "Veteran",
    desc: "Launch the OS 25 times",
    icon: "💎",
    check: (p) => p.launchCount >= 25,
  },
  {
    id: "time_traveler",
    name: "Time Traveler",
    desc: "Play for 1 hour total",
    icon: "⏳",
    check: (p) => p.totalPlayTime >= 3600,
  },
  {
    id: "explorer",
    name: "Explorer",
    desc: "Play 3 different games",
    icon: "🗺️",
    check: (p) => Object.keys(p.gamesPlayed).length >= 3,
  },
  {
    id: "collector",
    name: "Collector",
    desc: "Play 5 different games",
    icon: "🏆",
    check: (p) => Object.keys(p.gamesPlayed).length >= 5,
  },
  {
    id: "memory_100",
    name: "Memory Keeper",
    desc: "Earn 100 Memory Points",
    icon: "🧠",
    check: (p) => p.memoryPoints >= 100,
  },
  {
    id: "memory_500",
    name: "Memory Sage",
    desc: "Earn 500 Memory Points",
    icon: "🔮",
    check: (p) => p.memoryPoints >= 500,
  },
  {
    id: "minesweeper_easy",
    name: "Clear Mind",
    desc: "Win Minesweeper on Easy",
    icon: "🧹",
    check: (p) => p.gameData?.minesweeper?.bestTimes?.easy != null,
  },
  {
    id: "minesweeper_medium",
    name: "Strategist",
    desc: "Win Minesweeper on Medium",
    icon: "🧠",
    check: (p) => p.gameData?.minesweeper?.bestTimes?.medium != null,
  },
  {
    id: "minesweeper_hard",
    name: "Sapper",
    desc: "Win Minesweeper on Hard",
    icon: "💎",
    check: (p) => p.gameData?.minesweeper?.bestTimes?.hard != null,
  },
  {
    id: "century",
    name: "Century",
    desc: "Score 100 points in any game",
    icon: "💯",
    check: (p) =>
      Object.values(p.gamesPlayed).some((g) => g.highScore >= 100),
  },
]

class AchievementManager {
  static getAll() {
    return ACHIEVEMENTS
  }

  static getUnlocked(profile) {
    return ACHIEVEMENTS.filter((a) => profile.achievements.includes(a.id))
  }

  static getLocked(profile) {
    return ACHIEVEMENTS.filter((a) => !profile.achievements.includes(a.id))
  }

  static checkAndAward(profile) {
    const newOnes = []
    for (const ach of ACHIEVEMENTS) {
      if (profile.achievements.includes(ach.id)) continue
      if (ach.check(profile)) {
        ProfileManager.awardAchievement(ach.id)
        newOnes.push(ach)
      }
    }
    return newOnes
  }
}

export default AchievementManager
