import { TabBar  } from 'antd-mobile'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  AppOutline,
  UnorderedListOutline,
  MessageOutline,
  UserOutline,
} from 'antd-mobile-icons'
import './index.less'
import { useMount } from 'ahooks'
import Cookies from 'js-cookie'

const tabs = [
  {
    key: '/home',
    title: '首页',
    icon: <AppOutline />,
  },
  {
    key: '/todo',
    title: '我的待办',
    icon: <UnorderedListOutline />,
  },
  {
    key: '/message',
    title: '我的消息',
    icon: <MessageOutline />,
  },
  {
    key: '/profile',
    title: '个人中心',
    icon: <UserOutline />,
  },
]

export default function TabLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { pathname } = location

  const setRouteActive = (value: string) => {
    navigate(value)
  }

  useMount(() => {
    const token = Cookies.get('token')
    if (!token) {
      // Toast.show({
      //   icon: 'fail',
      //   content: '登录已过期，请重新登录',
      // })
      navigate('/login')
    }
  })

  return (
    <div className="tab-layout">
      <div className="tab-layout-content">
        <Outlet />
      </div>
      <div className="tab-layout-bottom">
        <TabBar activeKey={pathname} onChange={setRouteActive}>
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  )
}

