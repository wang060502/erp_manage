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

// 获取用户列表
export function getUserList(params: {
  page?: number
  limit?: number
  username?: string
  realName?: string
  mobile?: string
  status?: number
  deptId?: number
}) {
  return request({
    url: '/api/users',
    method: 'get',
    params,
  })
}

// 修改用户状态（启用/禁用）
export function updateUserStatus(userId: number, status: number) {
  return request({
    url: `/api/users/${userId}/status`,
    method: 'put',
    data: { status },
  })
}

// 重置用户密码
export function resetUserPassword(userId: number, password: string) {
  return request({
    url: `/api/users/${userId}/password`,
    method: 'put',
    data: { password },
  })
}

// 更新用户信息（管理员）
export function updateUser(
  userId: number,
  data: {
    realName?: string
    avatar?: string
    email?: string
    mobile?: string
    deptId?: number
    status?: number
    remark?: string
  },
) {
  return request({
    url: `/api/users/${userId}`,
    method: 'put',
    data,
  })
}
