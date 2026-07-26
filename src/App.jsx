import { useState } from "react"
import BootScreen from "./components/BootScreen"
import Desktop from "./components/Desktop"

export default function App() {
  const [booted, setBooted] = useState(false)

  if (!booted) {
    return <BootScreen onBootComplete={() => setBooted(true)} />
  }

  return <Desktop />
}
