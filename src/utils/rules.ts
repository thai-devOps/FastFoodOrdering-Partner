import * as yup from 'yup'
import { phoneRegExp } from '~/constants/pattern'
import { IAddress, IImage } from '~/types/user.type'
export const RegisterSchema = yup.object({
  name: yup
    .string()
    .required('Bạn cần nhập họ tên')
    .min(2, 'Họ tên phải có độ dài từ 5 - 160 ký tự')
    .max(160, 'Họ tên phải có độ dài từ 5 - 160 ký tự'),
  phone: yup
    .string()
    .required('Bạn cần nhập số điện thoại')
    .matches(phoneRegExp, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại không hợp lệ')
    .max(10, 'Số điện thoại không hợp lệ'),
  email: yup
    .string()
    .required('Bạn cần nhập email')
    .email('Email không đúng định dạng')
    .min(5, 'Email phải có độ dài từ 5 - 160 ký tự')
    .max(160, 'Email phải có độ dài từ 5 - 160 ký tự'),
  password: yup
    .string()
    .required('Bạn cần nhập mật khẩu')
    .min(6, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự')
    .max(160, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự'),
  password_confirmation: yup
    .string()
    .required('Bạn cần nhập lại mật khẩu')
    .min(6, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự')
    .max(160, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự')
    .oneOf([yup.ref('password')], 'Nhập lại mật khẩu không khớp')
})
export const LoginSchema = yup
  .object({
    email: yup
      .string()
      .required('Bạn cần nhập email')
      .email('Email không đúng định dạng')
      .min(5, 'Email phải có độ dài từ 5 - 160 ký tự')
      .max(160, 'Email phải có độ dài từ 5 - 160 ký tự'),
    password: yup
      .string()
      .required('Bạn cần nhập mật khẩu')
      .min(6, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự')
      .max(160, 'Mật khẩu phải có độ dài từ 6 - 160 ký tự')
  })
  .required()
export const profileSchema = yup.object({
  _id: yup.string().required('Bạn cần nhập id'),
  cccd: yup.string().required('Bạn cần nhập số chứng minh nhân dân'),
  avatar: yup.string().required('Bạn cần nhập avatar'),
  address: yup.string().required('Bạn cần nhập địa chỉ'),
  date_of_birth: yup.string().required('Bạn cần nhập ngày sinh'),
  gender: yup.string().required('Bạn cần nhập giới tính'),
  name: yup.string().required('Bạn cần nhập họ tên'),
  phone: yup
    .string()
    .required('Bạn cần nhập số điện thoại')
    .min(10, 'Số điện thoại không hợp lệ')
    .max(10, 'Số điện thoại không hợp lệ'),
  email: yup
    .string()
    .required('Bạn cần nhập email')
    .email('Email không đúng định dạng')
    .min(5, 'Email phải có độ dài từ 5 - 160 ký tự')
    .max(160, 'Email phải có độ dài từ 5 - 160 ký tự'),
  role: yup.string().required('Bạn cần nhập quyền')
})
/**
 * _id?: ObjectId
  name: string
  phone: string
  date_of_birth?: string
  gender: GENDER_TYPE
  email: string
  address: {
    province: string // Tỉnh/Thành phố
    district: string // Quận/Huyện
    ward: string // Phường/Xã
    houseNumber_street: string // Số nhà, tên đường
  }
  indentity_card: string // Số chứng minh nhân dân hoặc căn cước công dân
  password: string
  avatar?: string
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus
  is_active?: PARTNER_STATUS
  created_at?: Date
  updated_at?: Date
 */
export const partnerFormSchema = yup.object({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  _id: yup.string().optional(),
  name: yup
    .string()
    .required('Bạn cần nhập họ tên')
    .min(2, 'Tên phải có độ dài từ 2 - 50 ký tự')
    .max(160, 'Tên phải có độ dài từ 2 - 50 ký tự'),
  phone: yup
    .string()
    .required('Bạn cần nhập số điện thoại')
    .matches(phoneRegExp, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại không hợp lệ')
    .max(10, 'Số điện thoại không hợp lệ'),
  date_of_birth: yup.string().required('Bạn cần nhập ngày sinh'),
  gender: yup.string().required('Bạn cần chọn giới tính'),
  email: yup
    .string()
    .required('Bạn cần nhập email')
    .email('Email không đúng định dạng')
    .min(5, 'Email phải có độ dài từ 5 - 160 ký tự')
    .max(160, 'Email phải có độ dài từ 5 - 160 ký tự'),
  province: yup.string().required('Bạn cần nhập tỉnh/thành phố '), // Tỉnh/Thành phố
  district: yup.string().required('Bạn cần nhập quận/huyện '), // Quận/Huyện
  ward: yup.string().required('Bạn cần nhập phường/xã/thị trấn'), // Phường/Xã
  houseNumber_street: yup.string().required('Bạn cần nhập số nhà/tên đường'), // Số nhà, tên đường
  identity_number: yup
    .string()
    .required('Bạn cần nhập cccd/cmnn')
    .min(12, 'Số cccd/cmnn không hợp lệ') //036093002023
    .max(12, 'Số cccd/cmnn không hợp lệ') // Số chứng minh nhân dân hoặc căn cước công dân
})
export const restaurantSchema = yup.object({
  _id: yup.string().optional(),
  restaurant_name: yup.string().required('Bạn cần nhập tên nhà hàng'),
  restaurant_cuisine: yup.string().required('Bạn cần nhập ẩm thực nhà hàng'),
  restaurant_style: yup.string().required('Bạn cần chọn lĩnh vực nhà hàng'),
  description: yup.string().required('Bạn cần nhập mô tả nhà hàng'),
  open_time: yup.string().required('Chọn giờ mở cửa'),
  close_time: yup.string().required('Chọn giờ đóng cửa'),
  hotline: yup
    .string()
    .required('Bạn cần nhập số điện thoại')
    .matches(phoneRegExp, 'Số điện thoại không hợp lệ')
    .min(10, 'Số điện thoại không hợp lệ')
    .max(10, 'Số điện thoại không hợp lệ'),
  province: yup.string().required('Bạn cần nhập tỉnh/thành phố '), // Tỉnh/Thành phố
  district: yup.string().required('Bạn cần nhập quận/huyện '), // Quận/Huyện
  ward: yup.string().required('Bạn cần nhập phường/xã/thị trấn'), // Phường/Xã
  houseNumber_street: yup.string().required('Bạn cần nhập số nhà/tên đường') // Số nhà, tên đường
})
export const cardSchema = yup.object({
  _id: yup.string(),
  is_active: yup.boolean().required('Bạn cần thiết lập trạng thái mặc định'),
  card_number: yup
    .string()
    .required('Bạn cần nhập số thẻ')
    .min(16, 'Số thẻ không hợp lệ')
    .max(16, 'Số thẻ không hợp lệ'),
  card_holder_name: yup
    .string()
    .required('Bạn cần nhập tên chủ thẻ')
    .uppercase()
    .matches(/^[a-zA-Z ]*$/, 'Chỉ cho phép nhập chữ không dấu tiếng Anh'),
  expiration_date: yup.string().required('Bạn cần nhập ngày hết hạn'),
  security_code: yup.string().required('Bạn cần nhập cvv').min(3, 'cvv không hợp lệ').max(3, 'cvv không hợp lệ')
})
export const menuSchema = yup.object({
  _id: yup.string().optional(),
  name: yup.string().required('Bạn cần nhập tên menu'),
  description: yup.string().required('Bạn cần nhập mô tả menu'),
  is_draft: yup.boolean().required('Bạn cần thiết lập bản nháp'),
  is_active: yup.boolean().required('Bạn cần thiết lập trạng thái mặc định')
})
export const menuSectionSchema = yup.object({
  _id: yup.string().optional(),
  name: yup.string().required('Bạn cần nhập tên danh mục'),
  description: yup.string().required('Bạn cần nhập mô tả danh mục')
})
export const foodSchema = yup.object({
  _id: yup.string().optional(),
  name: yup.string().required('Bạn cần nhập tên món ăn'),
  description: yup.string().required('Bạn cần nhập mô tả món ăn'),
  price_before_discount: yup
    .number()
    .min(0, 'Giá gốc không được nhỏ hơn 0')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .transform((value) => (isNaN(value) ? undefined : parseFloat(value)))
    .required('Bạn cần nhập giá gốc'),
  price: yup
    .number()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .transform((value) => (isNaN(value) ? undefined : parseFloat(value)))
    .max(yup.ref('price_before_discount'), 'Giá khuyến mãi không được lớn hơn giá gốc')
    .required('Bạn cần nhập giá khuyến mãi'),
  food_type_id: yup.string().required('Bạn cần chọn loại món ăn')
})
export const categorySchema = yup.object({
  _id: yup.string().optional(),
  name: yup.string().required('Bạn cần nhập tên danh mục món ăn'),
  description: yup.string().required('Bạn cần nhập mô tả danh mục món ăn')
})
export const foodTypeSchema = yup.object({
  _id: yup.string().optional(),
  name: yup.string().required('Bạn cần nhập tên loại món ăn'),
  value: yup.string().required('Bạn cần nhập giá trị loại món ăn')
})
export type CategoryFormType = yup.InferType<typeof categorySchema>
export type CategoryRequestType = Pick<CategoryFormType, 'name' | 'description'> & {
  _id?: string
}
export type FoodTypeFormType = yup.InferType<typeof foodTypeSchema>
export type FoodTypeRequestType = Pick<FoodTypeFormType, 'name' | 'value'> & {
  _id?: string
}
export type FoodFormType = yup.InferType<typeof foodSchema>
export type FoodRequestType = Pick<
  FoodFormType,
  'name' | 'description' | 'price_before_discount' | 'price' | 'food_type_id'
> & {
  _id?: string
  menu_category_id: string
  image: IImage
  restaurant_id: string
}
export const labelSchema = yup.object({
  _id: yup.string().optional(),
  name: yup.string().required('Bạn cần nhập tên nhãn'),
  icon: yup.object().required('Bạn cần chọn icon')
})
export type LabelFormType = yup.InferType<typeof labelSchema>
export type LabelRequestType = Pick<LabelFormType, 'name' | 'icon'> & {
  _id?: string
}
export type MenuCategoryFormType = yup.InferType<typeof menuSectionSchema>
export type MenuSectionRequestType = Pick<MenuCategoryFormType, 'name' | 'description'> & {
  menuId: string
  _id?: string
}
export type MenuFormType = yup.InferType<typeof menuSchema>
export type MenuRequestType = Pick<MenuFormType, 'name' | 'description' | 'is_draft' | 'is_active' > & {
  shop_id: string
  _id?: string
}

export type CardFormType = yup.InferType<typeof cardSchema>
export type FormLoginType = yup.InferType<typeof LoginSchema>
export type FormRegisterType = yup.InferType<typeof RegisterSchema>
export type FormPartnerType = yup.InferType<typeof partnerFormSchema>
export type FormRestaurantType = yup.InferType<typeof restaurantSchema>
export type New_Form_Partner = Pick<
  FormPartnerType,
  '_id' | 'name' | 'phone' | 'date_of_birth' | 'gender' | 'identity_number' | 'email'
> & {
  address: IAddress
  avatar: {
    url: string
    public_id: string
  }
}
export type New_Form_Restaurant = Pick<
  FormRestaurantType,
  | '_id'
  | 'restaurant_name'
  | 'restaurant_cuisine'
  | 'restaurant_style'
  | 'open_time'
  | 'close_time'
  | 'hotline'
  | 'description'
> & {
  restaurant_address: IAddress
  r_background: IImage
}
