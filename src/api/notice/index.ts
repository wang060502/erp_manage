import request from '@/utils/request';

/**
 * 创建通知/公告
 * @param data {Object} 通知/公告参数
 * @param data.title {string} 标题
 * @param data.content {string} 内容
 * @param data.type {number} 类型（0-通知，1-公告）
 * @param data.receiver_scope {number} 接收范围（0-全员，1-部门，2-指定用户）
 * @param data.targets {Array<{type: number, id: number}>} 目标对象数组（可选）
 * @returns Promise<any>
 */
export function createNotification(data: {
  title: string;
  content: string;
  type: number;
  receiver_scope: number;
  targets?: Array<{ type: number; id: number }>;
}) {
  return request({
    url: '/api/notifications',
    method: 'POST',
    data,
  });
}

/**
 * 获取所有通知列表（管理员）
 * @param params {Object} 查询参数
 * @param params.page {number} 页码
 * @param params.pageSize {number} 每页条数
 * @param params.type {number} 类型（0-通知，1-公告）
 * @param params.receiver_scope {number} 接收范围（0-全员，1-部门，2-指定用户）
 * @param params.keyword {string} 关键词（可选）
 * @param params.startDate {string} 开始日期（可选）
 * @param params.endDate {string} 结束日期（可选）
 * @returns Promise<any>
 */
export function getNotificationList(params: {
  page?: number;
  pageSize?: number;
  type?: number;
  receiver_scope?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}) {
  return request({
    url: '/api/notifications/admin/list',
    method: 'GET',
    params,
  });
}

/**
 * 获取当前用户通知列表，支持分页和类型筛选
 * @param params {Object} 查询参数
 * @param params.page {number} 页码
 * @param params.pageSize {number} 每页条数
 * @param params.type {number} 类型（0-通知，1-公告）
 * @returns Promise<any>
 */
export function getUserNotificationList(params: {
  page: number;
  pageSize: number;
  type: number;
}) {
  return request({
    url: '/api/notifications',
    method: 'GET',
    params,
  });
}

/**
 * 获取通知详情
 * @param id {number} 通知ID
 * @returns Promise<any>
 */
export function getNotificationDetail(id: number) {
  return request({
    url: `/api/notifications/${id}`,
    method: 'GET',
  });
}

/**
 * 标记通知为已读
 * @param id {number} 通知ID
 * @returns Promise<any>
 */
export function markNotificationAsRead(id: number) {
  return request({
    url: `/api/notifications/${id}/read`,
    method: 'PUT',
  });
}

/**
 * 删除通知
 * @param id {number} 通知ID
 * @returns Promise<any>
 */
export function deleteNotification(id: number) {
  return request({
    url: `/api/notifications/${id}`,
    method: 'DELETE',
  });
}

/**
 * 获取当前用户未读通知数量
 * @returns Promise<{ code: number; data: { unread_count: number } }>
 */
export function getUnreadNotificationCount() {
  return request({
    url: '/api/notifications/unread/count',
    method: 'GET',
  });
}




