import { useState } from 'react'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './pages/home'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    </>
  )
}

export default App
