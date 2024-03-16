import { DiscountType, SellingStatus } from '~/enums'
import { IImage } from './user.type'

export interface Food {
  _id: string
  name: string
  description: string
  sold: number
  cost_of_goods_sold: number
  favorites: number
  price: number
  discount: {
    status: boolean
    type: DiscountType
    value: number
  }
  publish_status: boolean
  is_selling: SellingStatus
  menu_section_id: string
  shop_id: string
  quantity: number
  image: IImage
  created_at: Date
  updated_at: Date
}
