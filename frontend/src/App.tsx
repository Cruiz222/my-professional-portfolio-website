import './App.css'
import Header from './components/Header'
import About from './components/About'
import Projects from './components/Projects'
import UpdateTitle from './components/ProjectForm'

function App() {

  return (
    <main>

      <Header />

      <About />
      
      <Projects title="My Projects" />

      <UpdateTitle />
    </main>
           
  )
}

export default App
