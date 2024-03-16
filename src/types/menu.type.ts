export type IMenu = {
  _id: string
  name: string
  description: string
  partner_id: string
  is_draft: boolean
  is_active: boolean
  shop_id: string
  created_at: string
  updated_at: string
}
export interface MenuListConfig {
  page?: number | string
  limit?: number | string
  name?: string
  sort_by?: string
  order_by?: string
  is_draft?: string
  is_active?: string
  is_selling?: string
  publish_status?: string
  quantity?: string | number
  categories?: string
}
