import request from '@/utils/request'

export interface QueryOperationLogsParams {
  userId?: number
  operation?: string
  page?: number
  limit?: number
}

//获取操作日志列表
export function queryOperationLogs(params: QueryOperationLogsParams) {
  return request({
    url: '/api/operation-logs',
    method: 'get',
    params
  })
}