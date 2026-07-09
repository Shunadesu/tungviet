import { BrowserRouter, Routes, Route } from 'react-router-dom'
import EstimateQuotation from './pages/EstimateQuotation'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EstimateQuotation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
