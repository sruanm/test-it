import './App.css'
import { EventsPage } from './pages/events-page'
import { LoginPage } from './pages/login-page'

function App() {
  const hasToken = localStorage.getItem("token")

  return (
    <>
      <section id="center">
        {hasToken ? <EventsPage /> : <LoginPage />}
      </section>
    </>
  )
}

export default App
