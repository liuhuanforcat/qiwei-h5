import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Button, Form, Toast } from 'antd-mobile'
import { EyeInvisibleOutline, EyeOutline, UserOutline, LockOutline } from 'antd-mobile-icons'
import './index.less'

const Login = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    try {
      // 手动验证表单
      const values = await form.validateFields()
      
      setLoading(true)
      
      // 这里添加登录逻辑
      console.log('登录信息:', values)
      
      // 模拟登录请求
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Toast.show({
        icon: 'success',
        content: '登录成功',
      })
      
      // 登录成功后跳转
      navigate('/Home')
    } catch (error: any) {
      // 如果是验证错误，显示 Toast
      if (error?.errorFields) {
        const firstError = error.errorFields[0]
        const errorMessage = firstError?.errors?.[0] || '请检查输入信息'
        Toast.show({
          icon: 'fail',
          content: errorMessage,
        })
      } else {
        Toast.show({
          icon: 'fail',
          content: '登录失败，请重试',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="login-content">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-circle">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 className="login-title">欢迎回来</h1>
          <p className="login-subtitle">登录您的账户继续使用</p>
        </div>

        <Form
          form={form}
          className="login-form"
          validateTrigger={[]}
        >
          <Form.Item
            name="phone"
          >
            <div className="input-wrapper">
              <div className="input-icon">
                <UserOutline />
              </div>
              <Input
                placeholder="请输入手机号"
                clearable
                type="tel"
                maxLength={11}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="password"
          >
            <div className="input-wrapper">
              <div className="input-icon">
                <LockOutline />
              </div>
              <Input
                placeholder="请输入密码（至少6位）"
                clearable
                type={visible ? 'text' : 'password'}
              />
              <div className="eye-icon" onClick={() => setVisible(!visible)}>
                {visible ? <EyeOutline /> : <EyeInvisibleOutline />}
              </div>
            </div>
          </Form.Item>

          <Button
            color="primary"
            size="large"
            block
            loading={loading}
            className="login-btn"
            onClick={handleLogin}
          >
            立即登录
          </Button>
        </Form>

        <div className="login-footer">
          <p className="footer-text">首次登录将自动注册账号</p>
        </div>
      </div>
    </div>
  )
}

export default Login
