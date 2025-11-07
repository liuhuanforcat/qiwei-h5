import { useRoutes } from 'react-router-dom'
import Login from '../view/login'
import Home from '../view/home'
import NotFound from '../view/404'

export default function Router() {
  const routes = useRoutes([
    {
      path: '/Home',
      element: <Home />,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '*',
      element: <NotFound />,
    }
  ])

  return routes
}
   