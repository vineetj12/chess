import { Suspense } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Game from './screen/Game'
import Landing from './screen/Landing'

function App() {
  return (
    <>
    <div className='bg-slate-950'>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Suspense fallback="loader.."><Landing/></Suspense>}/>
        <Route path="/game" element={<Suspense fallback="loader.."><Game/></Suspense>}/>
      </Routes>
      </BrowserRouter>
      </div>
    </>
  )
}

export default App
