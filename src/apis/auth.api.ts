import { AuthResponse, LogoutResponse, RefreshTokenReponse } from '~/types/auth.type'
import { User } from '~/types/user.type'
import { SuccessResponse } from '~/types/utils.type'
import http from '~/utils/http'

export const URL_AUTHENTICATION = {
  LOGIN: '/partners/login',
  REGISTER: '/partners/register',
  LOGOUT: '/partners/logout',
  REFRESH_TOKEN: '/partners/refresh-access-token',
  FORGOT_PASSWORD: '/partners/forgot-password',
  RESET_PASSWORD: '/partners/reset-password',
  VERIFY_EMAIL: '/partners/verify-email',
  RESEND_VERIFY_EMAIL: '/partners/resend-verify-email',
  GET_ME: '/partners/me',
  UPDATE_ME: '/partners/me',
  CHANGE_PASSWORD: '/partners/change-password'
}
export interface IRegister {
  name: string
  phone: string
  email: string
  password: string
  password_confirmation?: string
}
export interface ILogin {
  email: string
  password: string
}

export const AUTH_API = {
  register: (body: IRegister) => http.post<SuccessResponse<User>>(URL_AUTHENTICATION.REGISTER, body),
  login: (body: ILogin) => http.post<SuccessResponse<AuthResponse>>(URL_AUTHENTICATION.LOGIN, body),
  logout: () =>
    http.post<SuccessResponse<LogoutResponse>>(URL_AUTHENTICATION.LOGOUT, {
      refresh_token: localStorage.getItem('refresh_token')
    }),
  refreshToken: () =>
    http.post<SuccessResponse<RefreshTokenReponse>>(URL_AUTHENTICATION.REFRESH_TOKEN, {
      refresh_token: localStorage.getItem('refresh_token')
    }),
  verifyEmail: (token: string) => http.get<AuthResponse>(URL_AUTHENTICATION.VERIFY_EMAIL + `?token=${token}`),
  resendVerifyEmail: () =>
    http.post<SuccessResponse<{ email_verify_token: string }>>(URL_AUTHENTICATION.RESEND_VERIFY_EMAIL)
}
