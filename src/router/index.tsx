import { useRoutes, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import TabLayout from '../components/TabLayout'

// 懒加载路由组件
const Login = lazy(() => import('../view/login'))
const Home = lazy(() => import('../view/home'))
const Todo = lazy(() => import('../view/todo'))
const Message = lazy(() => import('../view/message'))
const Profile = lazy(() => import('../view/profile'))
// const NotFound = lazy(() => import('../view/404'))

// 加载中的占位组件
const Loading = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>加载中...</div>
)

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
          element: (
            <Suspense fallback={<Loading />}>
              <Home />
            </Suspense>
          ),
        },
        {
          path: 'todo',
          element: (
            <Suspense fallback={<Loading />}>
              <Todo />
            </Suspense>
          ),
        },
        {
          path: 'message',
          element: (
            <Suspense fallback={<Loading />}>
              <Message />
            </Suspense>
          ),
        },
        {
          path: 'profile',
          element: (
            <Suspense fallback={<Loading />}>
              <Profile />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: '/login',
      element: (
        <Suspense fallback={<Loading />}>
          <Login />
        </Suspense>
      ),
    },
    // {
    //   path: '*',
    //   element: (
    //     <Suspense fallback={<Loading />}>
    //       <NotFound />
    //     </Suspense>
    //   ),
    // },
  ])

  return routes
}
