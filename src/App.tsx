import { NavLink, Route, Routes } from 'react-router-dom'
import { RestTimer, RestTimerProvider } from './components/RestTimer'
import DayPage from './pages/DayPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import WeekPage from './pages/WeekPage'
import WorkoutPage from './pages/WorkoutPage'

export default function App() {
  return (
    <RestTimerProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<WeekPage />} />
          <Route path="/dia/:dayId" element={<DayPage />} />
          <Route path="/entreno/:sessionId" element={<WorkoutPage />} />
          <Route path="/historial" element={<HistoryPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<WeekPage />} />
        </Routes>
      </div>
      <RestTimer />
      <div className="tabbar">
        <nav>
          <NavLink to="/" end>
            <Icon d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
            Semana
          </NavLink>
          <NavLink to="/historial">
            <Icon d="M4 19h16M6 15l4-5 3 3 5-7" />
            Historial
          </NavLink>
          <NavLink to="/perfil">
            <Icon d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" />
            Perfil
          </NavLink>
        </nav>
      </div>
    </RestTimerProvider>
  )
}

function Icon({ d }: { d: string }) {
  return (
    <svg className="ico" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
