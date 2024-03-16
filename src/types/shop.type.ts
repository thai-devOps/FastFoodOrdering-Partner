import { ShopStyles } from '~/enums'
import { IAddress, IImage } from './user.type'

export interface Shop {
  _id: string
  shop_image: IImage
  shop_name: string
  description: string
  shop_style: ShopStyles
  shop_address: IAddress
  hotline: string
  open_time: string
  close_time: string
  is_active: boolean
  rating: number
  partner_id: string
  created_at: Date
  updated_at: Date
}
