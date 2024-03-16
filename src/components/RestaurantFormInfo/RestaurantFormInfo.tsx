import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { useForm, useController, Controller, FormProvider } from 'react-hook-form'
import authApi from '~/apis/authApi'
import { AppContext } from '~/contexts/app.context'
import { DistrictType, ProvinceType, WardType } from '~/types/address.type'
import { setActiveStepToLS } from '~/utils/auth'
import { FormRestaurantType, restaurantSchema, New_Form_Restaurant } from '~/utils/rules'
import { isAxiosUnprocessableEntityError } from '~/utils/utils'
import InputFile from '../InputFile'
import { ErrorResponse } from '~/types/utils.type'
import CommonInput from '../CommonInput'
import { RestaurantStyle, ShopStyles } from '~/enums'
import { toast } from 'react-toastify'
import Loading from '../Loading'
import { ShopFormType, ShopRequestType, shopSchema } from '~/schemas/shop.schema'
import TextArea from '../AreaInput'
import { SHOP_API } from '~/apis/shops.api'

interface RestaurantFormInfoProps {
  setActiveStep2: React.Dispatch<React.SetStateAction<boolean>>
}

const RestaurantFormInfo: FC<RestaurantFormInfoProps> = ({ setActiveStep2 }) => {
  const { activeStep, setActiveStep } = useContext(AppContext)
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File>()
  const initValues: ShopFormType = {
    shop_name: '',
    shop_style: '',
    open_time: '',
    close_time: '',
    hotline: '',
    district: '',
    province: '',
    ward: '',
    houseNumber_street: '',
    description: ''
  }
  const methods = useForm<ShopFormType>({
    resolver: yupResolver(shopSchema),
    defaultValues: initValues
  })
  const {
    handleSubmit,
    register,
    watch,
    setError,
    control,
    formState: { errors }
  } = methods
  const { field, fieldState } = useController({
    name: 'shop_style',
    control,
    defaultValue: ''
  })
  const uploadAvatarMutaion = useMutation({
    mutationFn: async (form: FormData) => authApi.uploadAvatar(form)
  })
  const createShopMutation = useMutation({
    mutationFn: async (data: ShopRequestType) => SHOP_API.create(data)
  })
  const onSubmit = handleSubmit(async (data) => {
    if (!file) {
      toast.info('Vui lòng chọn ảnh nền')
      return
    } else {
      const new_data: ShopRequestType = {
        shop_name: data.shop_name,
        shop_style: data.shop_style,
        description: data.description,
        open_time: data.open_time,
        close_time: data.close_time,
        hotline: data.hotline,
        shop_address: {
          province: data.province,
          district: data.district,
          ward: data.ward,
          houseNumber_street: data.houseNumber_street
        },
        shop_image: {
          url: '',
          public_id: ''
        }
      }
      try {
        let img: {
          url: string
          public_id: string
        } = {
          url: '',
          public_id: ''
        }
        const form = new FormData()
        form.append('avatar', file)
        const uploadRes = await uploadAvatarMutaion.mutateAsync(form)
        img = uploadRes.data.data
        await createShopMutation.mutateAsync({ ...new_data, shop_image: img })
        await queryClient.invalidateQueries({
          queryKey: ['shopsData']
        })
        setActiveStepToLS([activeStep[0], true, activeStep[2], activeStep[3]])
        setActiveStep([activeStep[0], true, activeStep[2], activeStep[3]])
        setActiveStep2(false)
      } catch (error) {
        if (isAxiosUnprocessableEntityError<ErrorResponse<ShopFormType>>(error)) {
          const formError = error.response?.data.errors
          if (formError) {
            Object.keys(formError).forEach((key) => {
              setError(key as keyof ShopFormType, {
                message: formError[key as keyof ShopFormType],
                type: 'Server'
              })
            })
          }
        }
      }
    }
  })
  const handleChangeFile = (file?: File) => {
    setFile(file)
  }
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])
  const selectedProvinceId = watch('province', '')
  const { data: provinces } = useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const response = await fetch('https://vapi.vnappmob.com/api/province/')
      const data = (await response.json()) as {
        results: ProvinceType[]
      }
      return data.results
    }
  })
  const { data: districts } = useQuery({
    queryKey: ['districts', selectedProvinceId],
    queryFn: async () => {
      if (selectedProvinceId) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/district/${selectedProvinceId}`)
        const data = (await response.json()) as {
          results: DistrictType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedProvinceId
  })
  const selectedDistrictId = watch('district', '')
  const { data: wards } = useQuery({
    queryKey: ['wards', selectedDistrictId],
    queryFn: async () => {
      if (selectedDistrictId) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/ward/${selectedDistrictId}`)
        const data = (await response.json()) as {
          results: WardType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedDistrictId
  })

  return (
    <div>
      {createShopMutation.isPending || uploadAvatarMutaion.isPending ? (
        <Loading></Loading>
      ) : (
        <div className='grid gap-4 animate__animated animate__fadeIn gap-y-2 text-sm grid-cols-1 lg:grid-cols-2'>
          <div className='lg:col-span-2'>
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} noValidate>
                <div className='grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6'>
                  <div className='md:col-span-6'>
                    <div className='flex flex-col items-center'>
                      <div className='text-gray-600 italic mb-3'>Chọn ảnh nền nhà hàng / quán ăn</div>
                      <InputFile onChange={handleChangeFile} />
                      <div className='mt-3'>
                        <img
                          src={previewImage || '/images/restaurant_default.svg'}
                          alt='preview'
                          className='w-72 h-40 object-cover'
                        />
                      </div>
                      <div className='mt-3 text-gray-400'>
                        <div>Dụng lượng file tối đa 1 MB</div>
                        <div>Định dạng:.JPEG, .PNG</div>
                      </div>
                    </div>
                  </div>
                  <div className='md:col-span-4'>
                    <CommonInput
                      name='shop_name'
                      register={register}
                      type='text'
                      label='Tên shop'
                      requiredInput={true}
                      placeholder='Quán ăn Thủy Ngân'
                      className='mt-3'
                      errorMessage={errors.shop_name?.message}
                    />
                  </div>
                  <div className='md:col-span-2 mt-3'>
                    <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                      Lĩnh vực <span className='text-red-500'>*</span>
                    </div>
                    <select
                      {...field}
                      className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                    >
                      <option value='' disabled>
                        Chọn lĩnh vực
                      </option>
                      <option value={ShopStyles.BEVERAGE}>{ShopStyles.BEVERAGE}</option>
                      <option value={ShopStyles.COFFEE}>{ShopStyles.COFFEE}</option>
                      <option value={ShopStyles.DRINK}>{ShopStyles.DRINK}</option>
                      <option value={ShopStyles.FOOD}>{ShopStyles.FOOD}</option>
                      <option value={ShopStyles.MILK_TEA}>{ShopStyles.MILK_TEA}</option>
                      <option value={ShopStyles.DESSERT}>{ShopStyles.DESSERT}</option>
                    </select>
                    <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{fieldState.error?.message}</div>
                  </div>
                  <div className='md:col-span-6'>
                    <TextArea
                      name='description'
                      register={register}
                      type='text'
                      className='mt-3'
                      errorMessage={errors.description?.message}
                      label='Mô tả'
                      classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                      placeholder='Nhập mô tả về quán ăn của bạn'
                      requiredInput={true}
                    ></TextArea>
                  </div>
                  <div className='md:col-span-2'>
                    <CommonInput
                      name='hotline'
                      register={register}
                      type='tel'
                      className='mt-3'
                      errorMessage={errors.hotline?.message}
                      placeholder='0397706494'
                      label='Hotline'
                      requiredInput={true}
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <CommonInput
                      name='open_time'
                      register={register}
                      type='time'
                      className='mt-3'
                      errorMessage={errors.open_time?.message}
                      label='Giờ mở cửa'
                      requiredInput={true}
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <CommonInput
                      name='close_time'
                      register={register}
                      type='time'
                      className='mt-3'
                      errorMessage={errors.close_time?.message}
                      label='Giờ đóng cửa'
                      requiredInput={true}
                    />
                  </div>
                  <div className='md:col-span-6'>
                    <CommonInput
                      name='houseNumber_street'
                      register={register}
                      type='text'
                      className='mt-3'
                      errorMessage={errors.houseNumber_street?.message}
                      label='Số nhà / Tên đường'
                      autoComplete='off'
                      requiredInput={true}
                      placeholder='123, Trần Hưng Đạo'
                    />
                  </div>
                  <div className='md:col-span-2 mt-3'>
                    <Controller
                      name='province'
                      control={control}
                      defaultValue=''
                      render={({ field, fieldState }) => (
                        <>
                          <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                            Tỉnh / Thành phố <span className='text-red-500'>*</span>
                          </div>
                          <select
                            {...field}
                            className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                          >
                            <option value=''>--Chọn tỉnh/thành phố--</option>
                            {provinces?.map((province) => (
                              <option key={province.province_id} value={province.province_id}>
                                {province.province_name}
                              </option>
                            ))}
                          </select>
                          <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{fieldState.error?.message}</div>
                        </>
                      )}
                    />
                  </div>
                  <div className='md:col-span-2 mt-3'>
                    <Controller
                      name='district'
                      control={control}
                      defaultValue=''
                      render={({ field, fieldState }) => (
                        <>
                          <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                            Quận / Huyện <span className='text-red-500'>*</span>
                          </div>
                          <select
                            {...field}
                            className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                          >
                            <option value=''>--Chọn quận/huyện--</option>
                            {districts?.map((district) => (
                              <option key={district.district_id} value={district.district_id}>
                                {district.district_name}
                              </option>
                            ))}
                          </select>
                          <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{fieldState.error?.message}</div>
                        </>
                      )}
                    />
                  </div>
                  <div className='md:col-span-2 mt-3'>
                    <Controller
                      name='ward'
                      control={control}
                      defaultValue=''
                      render={({ field, fieldState }) => (
                        <>
                          <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                            Xã / Phường / Thị trấn <span className='text-red-500'>*</span>
                          </div>
                          <select
                            {...field}
                            className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                          >
                            <option value=''>--Chọn xã/phường/thị trấn--</option>
                            {wards?.map((ward) => (
                              <option key={ward.ward_id} value={ward.ward_id}>
                                {ward.ward_name}
                              </option>
                            ))}
                          </select>
                          <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{fieldState.error?.message}</div>
                        </>
                      )}
                    />
                  </div>
                  <div className='md:col-span-6 text-center'>
                    <div className='inline-flex items-end'>
                      <button
                        type='submit'
                        className='relative mt-5 inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800'
                      >
                        <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
                          Hoàn thành
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </div>
  )
}
export default RestaurantFormInfo
