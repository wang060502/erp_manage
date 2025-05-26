import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import router from '@/router'
// import { useAuthStore } from '@/stores/auth'
import { ElLoading, ElMessage } from 'element-plus'

// 创建 Axios 实例
const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 7000,
})

// 全局 loading 实例
let loadingInstance: any = null
// 请求计数器
let requestCount = 0

// 显示 loading
const showLoading = () => {
  if (requestCount === 0 && !loadingInstance) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)',
    })
  }
  requestCount++
}

// 隐藏 loading
const hideLoading = () => {
  if (requestCount > 0) {
    // 添加判断，防止计数器为负
    requestCount--
  }
  if (requestCount === 0 && loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

// 添加请求拦截器
instance.interceptors.request.use(
  async (config) => {
    // 定义不需要token的白名单路径
    // const whiteList = ['/user/authTokenByPassword', '/user/refreshToken']

    // 显示loading
    showLoading()

    // const authStore = useAuthStore()
    // const token = authStore.getToken

    // 如果不在白名单中才需要验证token
    // if (!whiteList.includes(config.url || '')) {
    //   if (!token) {
    //     // 尝试刷新token
    //     const refreshSuccess = await authStore.refreshAccessToken()
    //     if (!refreshSuccess) {
    //       hideLoading() // 确保在跳转前隐藏loading
    //       router.push('/login')
    //     return Promise.reject('no token')
    //   }
    // }
    // config.headers['platform'] = 'doctor'
    // 设置token到请求头
    config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token')
    // }

    return config
  },
  (error) => {
    hideLoading()
    return Promise.reject(error)
  },
)

// 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    // 在接收响应后关闭 loading
    hideLoading()

    // 检查响应状态
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }

    return res
  },
  function (error) {
    // 对响应错误做些什么
    hideLoading()

    // 错误消息处理
    let message = '请求失败'
    if (error.response) {
      // 有响应但状态码不正确
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          // 清除token并跳转到登录页
          const token = localStorage.getItem('token')
          if (token) {
            localStorage.removeItem('token')
            router.push('/login')
          }
          break
        case 403:
          message = '拒绝访问:' + error.response.data.error
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败: ${error.response.data.error || error.response.data.message || error.response.status}`
      }
    } else if (error.request) {
      // 发出了请求但没有收到响应
      message = '服务器无响应'
    } else {
      // 请求设置触发的错误
      message = error.message
    }

    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export default instance
