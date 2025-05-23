import request from '@/utils/request'

/**
 * 创建菜单
 * @param data 菜单参数
 * @returns Promise<any>
 */
export function createMenu(data: {
  parentId?: number
  menuName: string
  menuType: number
  path?: string
  component?: string
  perms?: string
  icon?: string
  sort?: number
  visible?: number
}) {
  return request.post('/api/menus', data)
}

/**
 * 获取菜单列表
 * @param params 查询参数
 * @returns Promise<any>
 */
export function getMenuList(params?: { menuName?: string; visible?: number }) {
  return request.get('/api/menus', { params })
}

/**
 * 更新菜单
 * @param menuId 菜单ID
 * @param data 菜单参数
 * @returns Promise<any>
 */
export function updateMenu(
  menuId: number,
  data: {
    parentId?: number
    menuName?: string
    menuType?: number
    path?: string
    component?: string
    perms?: string
    icon?: string
    sort?: number
    visible?: number
  },
) {
  return request.put(`/api/menus/${menuId}`, data)
}

/**
 * 删除菜单
 * @param menuId 菜单ID
 * @returns Promise<any>
 */
export function deleteMenu(menuId: number) {
  return request.delete(`/api/menus/${menuId}`)
}
