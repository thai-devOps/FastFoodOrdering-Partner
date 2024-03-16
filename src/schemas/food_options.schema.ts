import * as yup from 'yup'

export const foodOptionSchema = yup.object({
  name: yup.string().required('Tên tùy chọn là bắt bọn'),
})
export type FoodOption = yup.InferType<typeof foodOptionSchema>

