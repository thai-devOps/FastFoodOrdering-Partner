export interface FoodOptions {
  _id?: string
  name: string
  isSingleSelect: boolean // true: chỉ chọn 1 option, false: có thể chọn nhiều option
  food_id?: string
  options: {
    _id?: string
    name: string
    price: number
    food_option_id?: string
    created_at?: string
    updated_at?: string
  }[]
  created_at?: string
  updated_at?: string
}
