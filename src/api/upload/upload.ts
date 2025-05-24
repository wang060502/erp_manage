import request from '@/utils/request'

/**
 * 上传单个文件并返回文件URL
 * @param file 要上传的文件对象
 * @returns 上传结果
 */
export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/api/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
