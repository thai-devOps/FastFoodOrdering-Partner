import axios, { AxiosError, type AxiosInstance } from 'axios'
import { AuthResponse, RefreshTokenReponse } from '~/types/auth.type'
import {
  clearLS,
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  setAccessTokenToLS,
  setProfileToLS,
  setRefreshTokenToLS
} from './auth'
import { URL_LOGIN, URL_LOGOUT, URL_REFRESH_TOKEN } from '~/apis/authApi'
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from './utils'
import { HttpStatusCode } from '~/enums'
import { ErrorResponse } from '~/types/utils.type'
import { toast } from 'react-toastify'

export class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string
  private refreshTokenRequest: Promise<{
    access_token: string
    refresh_token: string
  }> | null
  constructor() {
    this.accessToken = getAccessTokenFromLS()
    this.refreshToken = getRefreshTokenFromLS()
    this.refreshTokenRequest = null
    this.instance = axios.create({
      baseURL: 'http://localhost:3000/api/v1/partners/',
      timeout: 30000, // dùng để hủy request sau 10s
      headers: {
        'Content-Type': 'application/json'
        // 'expire-access-token': 60 * 60 * 24, // 1 ngày
        // 'expire-refresh-token': 60 * 60 * 24 * 160 // 160 ngày
      }
    })
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.authorization = this.accessToken
          return config
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    // Add a response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        if (url === URL_LOGIN) {
          const data = response.data as AuthResponse
          this.accessToken = 'Bearer ' + data.data.access_token
          this.refreshToken = data.data.refresh_token
          setAccessTokenToLS(this.accessToken)
          setRefreshTokenToLS(this.refreshToken)
          setProfileToLS(data.data.partner)
        } else if (url === URL_LOGOUT) {
          this.accessToken = ''
          this.refreshToken = ''
          clearLS()
        }
        return response
      },
      async (error: AxiosError) => {
        // Chỉ toast lỗi không phải 422 và 401
        if (
          ![
            HttpStatusCode.UnprocessableEntity,
            HttpStatusCode.Unauthorized,
            HttpStatusCode.InternalServerError
          ].includes(error.response?.status as number)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
          const data: any | undefined = error.response?.data
          const message = (data?.message || error.message) as string
          toast.error(message)
        }

        // Lỗi Unauthorized (401) có rất nhiều trường hợp
        // - Token không đúng
        // - Không truyền token
        // - Token hết hạn*

        // Nếu là lỗi 401
        if (isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(error)) {
          const config = error.response?.config || { headers: {}, url: '' }
          const { url } = config
          // Trường hợp Token hết hạn và request đó không phải là của request refresh token
          // thì chúng ta mới tiến hành gọi refresh token
          if (isAxiosExpiredTokenError(error) && url !== URL_REFRESH_TOKEN) {
            // Hạn chế gọi 2 lần handleRefreshToken
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  // Giữ refreshTokenRequest trong 10s cho những request tiếp theo nếu có 401 thì dùng
                  setTimeout(() => {
                    this.refreshTokenRequest = null
                  }, 10000)
                })
            return this.refreshTokenRequest.then((res) => {
              // Nghĩa là chúng ta tiếp tục gọi lại request cũ vừa bị lỗi
              return this.instance({
                ...config,
                headers: { ...config.headers, authorization: res.access_token },
                data: { refresh_token: res.refresh_token }
              })
            })
          }

          // Còn những trường hợp như token không đúng
          // không truyền token,
          // token hết hạn nhưng gọi refresh token bị fail
          // thì tiến hành xóa local storage và toast message

          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
          // toast.error(error.response?.data.data?.message || error.response?.data.message)
          // window.location.reload()
        }
        return Promise.reject(error)
      }
    )
  }
  private async handleRefreshToken() {
    try {
      const res = await this.instance.post<RefreshTokenReponse>(URL_REFRESH_TOKEN, {
        refresh_token: this.refreshToken
      })
      const { access_token, refresh_token } = res.data.data
      setAccessTokenToLS(access_token)
      setRefreshTokenToLS(refresh_token)
      this.accessToken = 'Bearer ' + access_token
      this.refreshToken = refresh_token
      return {
        access_token: this.accessToken,
        refresh_token: this.refreshToken
      }
    } catch (error) {
      clearLS()
      this.accessToken = ''
      this.refreshToken = ''
      throw error
    }
  }
}
const http = new Http().instance
export default http
