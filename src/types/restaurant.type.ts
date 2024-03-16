import { RESTAURANT_STATUS, RestaurantStyle } from '~/enums'
import { IAddress } from './user.type'

export type Restaurant = {
  _id: string
  r_background: {
    url: string
    public_id: string
  }
  restaurant_name: string
  restaurant_cuisine: string
  description: string
  restaurant_style: RestaurantStyle
  open_time: string
  close_time: string
  is_active: RESTAURANT_STATUS
  restaurant_address: IAddress
  hotline: string
  partner_id: string
  created_at: string
  updated_at: string
}
