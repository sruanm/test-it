import './App.css'
import { LoginPage } from './pages/login-page'

function App() {

  const hasToken = localStorage.getItem("token")

  return (
    <>
      <section id="center">
        {hasToken ? <h1>Bem vindo!</h1> :
          <LoginPage />
        }
      </section>
    </>
  )
}

export default App
