import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './Components/Themes/ThemeContext.jsx'
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import history from './history/history.js'




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <HistoryRouter history={history}>
        <App />
      </HistoryRouter>
    </ThemeProvider>
  </StrictMode>,
)
