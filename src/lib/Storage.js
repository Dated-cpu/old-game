const PREFIX = "nostalgia_"

class Storage {
  static get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw !== null ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(PREFIX + key)
      return true
    } catch {
      return false
    }
  }
}

export default Storage
