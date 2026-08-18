import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProjectReport from './pages/ProjectReport'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectReport />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
