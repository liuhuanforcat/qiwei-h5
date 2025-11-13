import { useRoutes, Navigate } from 'react-router-dom'
import Login from '../view/login'
import TabLayout from '../components/TabLayout'
import Home from '../view/home'
import Todo from '../view/todo'
import Message from '../view/message'
import Profile from '../view/profile'
import NotFound from '../view/404'

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: <TabLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/home" replace />,
        },
        {
          path: 'home',
          element: <Home />,
        },
        {
          path: 'todo',
          element: <Todo />,
        },
        {
          path: 'message',
          element: <Message />,
        },
        {
          path: 'profile',
          element: <Profile />,
        },
      ],
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ])

  return routes
}
