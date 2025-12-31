import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AIModule from './ai-module/AIModule'
import PlanHelper from './ai-module-my/planHelper.tsx'
import { Main } from './ai-module-my/chat/main/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ai-assistant" element={<AIModule />} />
        <Route path='/plan-helper' element={<PlanHelper />} />
        <Route path='/ai-chat' element={<Main />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
