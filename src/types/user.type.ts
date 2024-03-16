import { GENDER_TYPE, PARTNER_STATUS, UserVerifyStatus } from '~/enums'
export interface IAddress {
  province: string // Tỉnh/Thành phố
  district: string // Quận/Huyện
  ward: string // Phường/Xã
  houseNumber_street: string // Số nhà, tên đường
}
export interface IImage {
  url: string
  public_id: string
}
export type User = {
  _id: string
  email: string
  password: string
  phone: string
  name: string
  gender: GENDER_TYPE
  date_of_birth: string
  identity_number: string
  address: IAddress
  avatar: IImage
  email_verify_token: string | null
  forgot_password_token: string | null
  verify: UserVerifyStatus
  is_active: PARTNER_STATUS
  created_at: string
  updated_at: string
}
