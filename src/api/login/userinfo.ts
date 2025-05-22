import request from '@/utils/request'

// 获取当前登录用户信息
export function getUserProfile() {
  return request.get('/api/users/profile')
}
