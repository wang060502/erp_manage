import request from '@/utils/request'

export interface CreateDepartmentParams {
  parentId?: number
  deptName: string
  orderNum?: number
  status?: number
}

//创建部门
export function createDepartment(data: CreateDepartmentParams) {
  return request({
    url: '/api/depts',
    method: 'post',
    data,
  })
}

// 部门树节点类型
export interface DepartmentTreeItem {
  dept_id: number
  parent_id: number
  dept_name: string
  order_num: number
  status: number
  children?: DepartmentTreeItem[]
}

// 获取部门树
export function getDepartmentTree() {
  return request<{
    code: number
    depts: DepartmentTreeItem[]
  }>({
    url: '/api/depts',
    method: 'get',
  })
}

export interface UpdateDepartmentParams {
  parentId?: number
  deptName?: string
  orderNum?: number
  status?: number
}

//更新部门
export function updateDepartment(deptId: number, data: UpdateDepartmentParams) {
  return request({
    url: `/api/depts/${deptId}`,
    method: 'put',
    data,
  })
}

// 删除部门
export function deleteDepartment(deptId: number) {
  return request({
    url: `/api/depts/${deptId}`,
    method: 'delete',
  })
}
