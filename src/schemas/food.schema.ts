import * as yup from 'yup'
import { SellingStatus, DiscountType } from '~/enums'
import { FoodOptions } from '~/types/food_options.type'
import { IImage } from '~/types/user.type'
export const foodSchema = yup.object({
  _id: yup.string().optional(),
  name: yup.string().required('Bạn cần nhập tên món ăn'),
  description: yup.string().required('Bạn cần nhập mô tả món ăn'),
  price: yup
    .number()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .transform((value) => (isNaN(value) ? undefined : parseFloat(value)))
    .required('Bạn cần nhập giá bán'),
  cost_of_goods_sold: yup
    .number()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .transform((value) => (isNaN(value) ? undefined : parseFloat(value)))
    .required('Bạn cần nhập giá vốn món ăn'),
  publish_status: yup.boolean().required('Bạn cần chọn trạng thái hiển thị'),
  is_selling: yup.bool().required('Bạn cần chọn trạng thái bán'),
  quantity: yup
    .number()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .transform((value) => (isNaN(value) ? undefined : parseFloat(value)))
    .required('Bạn cần số lượng'),
  discount_status: yup.boolean().required('Bạn cần chọn trạng thái giảm giá'),
  discount_type: yup.string().optional(),
  discount_value: yup
    .number()
    .optional()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .transform((value) => (isNaN(value) ? undefined : parseFloat(value)))
})
export type FoodFormType = yup.InferType<typeof foodSchema>
export type FoodRequestType = Pick<
  FoodFormType,
  'name' | 'description' | 'price' | 'quantity' | 'cost_of_goods_sold'
> & {
  image: IImage
  menu_section_id: string
  shop_id: string
  _id?: string
  categories: string[]
  foodOptions: FoodOptions[]
  publish_status: boolean
  is_selling: SellingStatus
  discount: {
    status: boolean
    type: DiscountType
    value: number
  }
}
