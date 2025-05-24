import request from '@/utils/request'

/**
 * 新增产品分类
 * @param data 分类信息
 * @returns Promise
 */
export function createProductCategory(data: {
  category_name: string
  status?: number // 0-禁用 1-启用，默认1
}) {
  return request({
    url: '/api/product-categories',
    method: 'post',
    data,
  })
}

/**
 * 获取产品分类列表
 * @returns Promise
 */
export function getProductCategoryList() {
  return request({
    url: '/api/product-categories',
    method: 'get',
  })
}

/**
 * 修改产品分类
 * @param categoryId 分类ID
 * @param data 分类信息（可选字段）
 * @returns Promise
 */
export function updateProductCategory(
  categoryId: number,
  data: {
    category_name?: string
    status?: number
  },
) {
  return request({
    url: `/api/product-categories/${categoryId}`,
    method: 'put',
    data,
  })
}

/**
 * 删除产品分类
 * @param categoryId 分类ID
 * @returns Promise
 */
export function deleteProductCategory(categoryId: number) {
  return request({
    url: `/api/product-categories/${categoryId}`,
    method: 'delete',
  })
}
