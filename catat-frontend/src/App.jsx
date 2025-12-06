import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LetterGeneratorPage from './pages/LetterGeneratorPage'
import LettersPage from './pages/LettersPage'
import LetterEditorPage from './pages/LetterEditorPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/generate" element={<LetterGeneratorPage />} />
        <Route path="/letters" element={<LettersPage />} />
        <Route path="/letters/:id/edit" element={<LetterEditorPage />} />
      </Routes>
    </Router>
  )
}

export default App
