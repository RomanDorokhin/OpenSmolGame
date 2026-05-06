import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import { AuthCallback } from './pages/AuthCallback'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/github/callback" element={<AuthCallback />} />
    </Routes>
  )
}
