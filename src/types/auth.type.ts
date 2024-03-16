import { TOKEN_TYPE } from '~/enums'
import { User } from './user.type'
import { SuccessResponse } from './utils.type'

export type JWTError = {
  type: TOKEN_TYPE
  message: string
}

export type AuthResponse = SuccessResponse<{
  partner: User
  access_token: string
  refresh_token: string
  access_token_EXP: number
  refresh_token_EXP: number
}>
export type LogoutResponse = SuccessResponse<{
  acknowledged: boolean
  deletedCount: number
}>
export type ProfileResponse = SuccessResponse<User>

export type RefreshTokenReponse = SuccessResponse<{ access_token: string; refresh_token: string }>
