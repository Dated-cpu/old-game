import { useState, useEffect } from "react"
import Storage from "../lib/Storage"

const PROFILE_KEY = "profile"
const LISTENERS_KEY = "__profile_listeners__"

function defaultProfile() {
  return {
    firstLaunch: null,
    launchCount: 0,
    totalPlayTime: 0,
    gamesPlayed: {},
    achievements: [],
    memoryPoints: 0,
    gameData: {},
  }
}

class ProfileManager {
  static #listeners = new Set()
  static #data = null

  static init() {
    if (this.#data) return this.#data

    this.#data = Storage.get(PROFILE_KEY, null)

    if (!this.#data) {
      this.#data = defaultProfile()
      this.#data.firstLaunch = new Date().toISOString()
    }

    this.#data.launchCount += 1
    this.#save()

    return this.#data
  }

  static get() {
    if (!this.#data) this.init()
    return { ...this.#data }
  }

  static recordGamePlayed(gameId, score = 0) {
    if (!this.#data) this.init()

    const game = this.#data.gamesPlayed[gameId] || {
      plays: 0,
      highScore: 0,
      totalScore: 0,
      totalTime: 0,
    }

    game.plays += 1
    game.totalScore += score
    if (score > game.highScore) {
      game.highScore = score
    }

    this.#data.gamesPlayed[gameId] = game
    this.#save()
  }

  static addPlayTime(seconds) {
    if (!this.#data) this.init()
    this.#data.totalPlayTime += seconds
    this.#save()
  }

  static addMemoryPoints(points) {
    if (!this.#data) this.init()
    this.#data.memoryPoints += points
    this.#save()
  }

  static awardAchievement(id) {
    if (!this.#data) this.init()
    if (this.#data.achievements.includes(id)) return false
    this.#data.achievements.push(id)
    this.#save()
    return true
  }

  static updateGameData(gameId, data) {
    if (!this.#data) this.init()
    if (!this.#data.gameData) this.#data.gameData = {}
    this.#data.gameData[gameId] = { ...this.#data.gameData[gameId], ...data }
    this.#save()
  }

  static getGameData(gameId) {
    if (!this.#data) this.init()
    return { ...this.#data.gameData?.[gameId] } || {}
  }

  static subscribe(fn) {
    this.#listeners.add(fn)
    return () => this.#listeners.delete(fn)
  }

  static #save() {
    if (this.#data) {
      Storage.set(PROFILE_KEY, this.#data)
      this.#listeners.forEach((fn) => fn(this.#data))
    }
  }
}

export function useProfile() {
  const [profile, setProfile] = useState(() => ProfileManager.init())

  useEffect(() => {
    const unsub = ProfileManager.subscribe((data) => setProfile({ ...data }))
    return unsub
  }, [])

  return profile
}

export default ProfileManager
