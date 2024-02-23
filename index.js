import axios from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { useUserStore } from '@/stores/user'
/**
 * @description 创建请求实例
 */
function createService() {
  // 创建一个 axios 实例
  const service = axios.create({
    timeout: 1000 * 60 * 5,
    baseURL: import.meta.env.DEV ? '/api' : 'http://nas.yzzd.com:18000/'
  })

  // 请求拦截
  service.interceptors.request.use(
    (config) => {
      const userState = useUserStore()
      if (userState.userInfo.token) {
        // 将token设置为DEV下不同的值
        // config.headers['token'] = import.meta.env.DEV
        //   ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNWI1NzQyNGE3ODE0NTMyYWI1YjhjODJkMzM5OWVkNyIsImV4cCI6MTcwMzc4NDAwMX0.vgLR3i9KjfOctlNdc8DgLTcDpR13-qt7IiHrr_yQ3Cc'
        //   : userState.userInfo.token
        config.headers['token'] = userState.userInfo.token
      }

      return config
    },
    (error) => {
      // 发送失败
      console.log(error)
      return Promise.reject(error)
    }
  )
  // 响应拦截
  service.interceptors.response.use(
    (response) => {
      if (response.data.errorCode == 401) {
        response.status = 401
        const e = {
          response: response
        }
        throw e
      } else if (response.data.errorCode > 0 && !response.config.noErrorTips) {
        ElMessage({
          message: response.data.message,
          type: 'error'
        })
        return Promise.reject(response)
      }

      if (response.config.responseType === 'blob') {
        return response
      }
      if (response.config.unpack) {
        return response
      }
      return response.data
    },
    (error) => {
      const status = error.response.status
      switch (status) {
        case 400:
          ElMessage({
            message:
              'The client sent an invalid request, such as missing required request body or parameters.',
            type: 'error'
          })
          break
        case 401:
          ElMessage({
            message: 'The client failed to authenticate with the server.',
            type: 'error'
          })
          break
        case 403:
          ElMessage({
            message:
              'The client is authenticated but does not have permission to access the requested resource.',
            type: 'error'
          })
          break
        case 404:
          ElMessage({
            message: 'The requested resource does not exist.',
            type: 'error'
          })
          break
        case 412:
          ElMessage({
            message: 'One or more conditions in the request header fields evaluate to false.',
            type: 'error'
          })
          break
        case 500:
          ElMessage({
            message: 'The server encountered a general error.',
            type: 'error'
          })
          break
        case 503:
          ElMessage({
            message: 'The requested service is unavailable.',
            type: 'error'
          })
          break
        default:
          ElMessage({
            message: 'Unknown error.',
            type: 'error'
          })
          break
      }
      return Promise.reject(error)
    }
  )
  return service
}

// 用于真实网络请求的实例和请求方法
export default createService()
