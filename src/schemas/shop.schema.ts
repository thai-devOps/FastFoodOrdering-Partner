import * as yup from 'yup'
import { IAddress, IImage } from '~/types/user.type'
/**
 *shop_image: IImage
  shop_name: string
  description: string
  shop_style: ShopStyles
  shop_address: IAddress
  hotline: string
  open_time: string
  close_time: string
  partner_id?: string
 */
export const shopSchema = yup.object({
  _id: yup.string().optional(),
  shop_name: yup.string().required('Bạn cần nhập tên shop'),
  description: yup.string().required('Bạn cần nhập mô tả shop'),
  shop_style: yup.string().required('Bạn cần chọn loại shop'),
  hotline: yup.string().required('Bạn cần nhập số điện thoại liên hệ'),
  open_time: yup.string().required('Bạn cần nhập giờ mở cửa'),
  close_time: yup.string().required('Bạn cần nhập giờ đóng cửa'),
  province: yup.string().required('Bạn cần nhập tỉnh/thành phố '),
  district: yup.string().required('Bạn cần nhập quận/huyện '),
  ward: yup.string().required('Bạn cần nhập phường/xã/thị trấn'),
  houseNumber_street: yup.string().required('Bạn cần nhập số nhà/tên đường')
})
export type ShopFormType = yup.InferType<typeof shopSchema>
export type ShopRequestType = Pick<
  ShopFormType,
  'shop_name' | 'description' | 'shop_style' | 'hotline' | 'open_time' | 'close_time'
> & { shop_image: IImage; shop_address: IAddress; partner_id?: string; _id?: string }
