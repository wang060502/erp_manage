import request from '@/utils/request'

// 创建角色
export function createRole(data: {
  roleCode: string
  roleName: string
  dataScope?: number
  remark?: string
}) {
  return request({
    url: '/api/roles',
    method: 'post',
    data,
  })
}

// 获取角色列表
export function getRoleList(params: { page?: number; limit?: number; roleName?: string }) {
  return request({
    url: '/api/roles',
    method: 'get',
    params,
  })
}

// 更新角色
export function updateRole(
  roleId: number,
  data: {
    roleName?: string
    dataScope?: number
    remark?: string
  },
) {
  return request({
    url: `/api/roles/${roleId}`,
    method: 'put',
    data,
  })
}

// 删除角色
export function deleteRole(roleId: number) {
  return request({
    url: `/api/roles/${roleId}`,
    method: 'delete',
  })
}

// 分配角色菜单权限
export function assignRoleMenus(roleId: number, menuIds: number[]) {
  return request({
    url: `/api/roles/${roleId}/menus`,
    method: 'post',
    data: { menuIds },
  })
}

// 获取角色已绑定的菜单列表
export function getRoleMenus(roleId: number) {
  return request({
    url: `/api/roles/${roleId}/menus`,
    method: 'get',
  })
}

// 获取未绑定任何角色的用户列表
export function getUnassignedUsers(params: {
  page?: number
  limit?: number
  username?: string
  realName?: string
}) {
  return request({
    url: '/api/roles/unassigned-users',
    method: 'get',
    params,
  })
}

// 为角色批量分配用户
export function assignRoleUsers(roleId: number, userIds: number[]) {
  return request({
    url: `/api/roles/${roleId}/users`,
    method: 'post',
    data: { userIds },
  })
}
