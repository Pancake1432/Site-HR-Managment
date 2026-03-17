import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SettingsProvider } from './contexts/SettingsContext'
import './styles/global.css'

// document.getElementById('root') este punctul de montare React standard din index.html.
// Acesta este singurul loc permis pentru acces direct la DOM — necesar pentru bootstrap-ul React.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>,
)
