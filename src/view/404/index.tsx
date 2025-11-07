import { useNavigate } from 'react-router-dom'
import { Button } from 'antd-mobile'
import './index.less'

const NotFound = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/Home')
  }

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <div className="error-title">页面未找到</div>
        <div className="error-description">
          抱歉，您访问的页面不存在或已被移除
        </div>
        <Button 
          color="primary" 
          size="large" 
          className="back-home-btn" 
          onClick={handleGoHome}
        >
          返回首页
        </Button>
      </div>
    </div>
  )
}

export default NotFound

