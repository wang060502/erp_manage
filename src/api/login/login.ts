import request from '@/utils/request'

// 注册用户
export function registerUser(data: {
  username: string
  password: string
  realName?: string
  avatar?: string
  email?: string
  mobile?: string
  deptId?: number
  status?: number
}) {
  return request.post('/api/users/register', data)
}

// 登录
export function loginUser(data: { username: string; password: string }) {
  return request.post('/api/users/login', data)
}
