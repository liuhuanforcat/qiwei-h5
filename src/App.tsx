import './App.less'
import Router from './router'
import { TaskProvider } from './context/TaskContext'

function App() {
  return (
    <TaskProvider>
      <Router />
    </TaskProvider>
  )
}

export default App
