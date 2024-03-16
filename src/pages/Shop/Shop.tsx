import { useContext, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { AppContext } from '~/contexts/app.context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SHOP_API } from '~/apis/shops.api'
import Loading from '~/components/Loading'
import {
  UilClock,
  UilFire,
  UilGlassMartini,
  UilInfoCircle,
  UilMap,
  UilPhone,
  UilShop,
  UilStar,
  UilUtensils
} from '@iconscout/react-unicons'
import { ShopStyles } from '~/enums'
import { DistrictType, ProvinceType, WardType } from '~/types/address.type'
import { yupResolver } from '@hookform/resolvers/yup'
import { Save } from 'lucide-react'
import { useForm, useController, FormProvider, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import authApi from '~/apis/authApi'
import TextArea from '~/components/AreaInput'
import CommonInput from '~/components/CommonInput'
import { ShopFormType, shopSchema, ShopRequestType } from '~/schemas/shop.schema'
import { isAxiosUnprocessableEntityError } from '~/utils/utils'
import { ErrorResponse } from '~/types/utils.type'
import InputFile from '~/components/InputFile'
const Shop = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [openSideBar] = useState(true)
  const [file, setFile] = useState<File>()
  const { shop, setShop } = useContext(AppContext)
  const queryClient = useQueryClient()
  const handleChangeFile = (file?: File) => {
    setFile(file)
  }
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])
  const { data: shopsData, isLoading } = useQuery({
    queryKey: ['shopsData'],
    queryFn: () => SHOP_API.getByPartnerId(),
    retry: 1
  })
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
  useEffect(() => {
    if (shopsData) {
      setShop(shopsData?.data.data)
      methods.setValue('_id', shopsData?.data.data._id)
      methods.setValue('shop_name', shopsData?.data.data.shop_name)
      methods.setValue('shop_style', shopsData?.data.data.shop_style)
      methods.setValue('open_time', shopsData?.data.data.open_time)
      methods.setValue('close_time', shopsData?.data.data.close_time)
      methods.setValue('hotline', shopsData?.data.data.hotline)
      methods.setValue('description', shopsData?.data.data.description)
      methods.setValue('province', shopsData?.data.data.shop_address.province)
      methods.setValue('district', shopsData?.data.data.shop_address.district)
      methods.setValue('ward', shopsData?.data.data.shop_address.ward)
      methods.setValue('houseNumber_street', shopsData?.data.data.shop_address.houseNumber_street)
    }
  }, [shopsData, setShop, methods])
  const {
    handleSubmit,
    register,
    watch,
    setError,
    control,
    formState: { errors }
  } = methods
  const selectedProvince = watch('province')
  const selectedDistrict = watch('district')
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
    queryKey: ['districts', selectedProvince],
    queryFn: async () => {
      if (selectedProvince) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/district/${selectedProvince}`)
        const data = (await response.json()) as {
          results: DistrictType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedProvince
  })
  const { data: wards } = useQuery({
    queryKey: ['wardsRestaurant', selectedDistrict],
    queryFn: async () => {
      if (selectedDistrict) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/ward/${selectedDistrict}`)
        const data = (await response.json()) as {
          results: WardType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!selectedDistrict
  })
  const { data: shopProvincesData, isLoading: isLoadingProvince } = useQuery({
    queryKey: ['shopProvincesData'],
    queryFn: async () => {
      const response = await fetch('https://vapi.vnappmob.com/api/province/')
      const data = (await response.json()) as {
        results: ProvinceType[]
      }
      return data.results
    }
  })
  const { data: shopDictrictsData, isLoading: isLoadingDistricts } = useQuery({
    queryKey: ['shopDictrictsData', shop?.shop_address.province],
    queryFn: async () => {
      if (shop?.shop_address.province) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/district/${shop?.shop_address.province}`)
        const data = (await response.json()) as {
          results: DistrictType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!shop?.shop_address.province
  })
  const { data: shopWardsData, isLoading: isLoadingWards } = useQuery({
    queryKey: ['shopWardsData', shop?.shop_address.district],
    queryFn: async () => {
      if (shop?.shop_address.district) {
        const response = await fetch(`https://vapi.vnappmob.com/api/province/ward/${shop?.shop_address.district}`)
        const data = (await response.json()) as {
          results: WardType[]
        }
        return data.results
      }
      return []
    },
    enabled: !!shop?.shop_address.district
  })
  const { field, fieldState } = useController({
    name: 'shop_style',
    control,
    defaultValue: ''
  })
  const updateAvatar = useMutation({
    mutationFn: (form: FormData) => authApi.updateAvatar(form)
  })
  const updateShopMutation = useMutation({
    mutationFn: (data: ShopRequestType) => SHOP_API.updateById(data)
  })
  const onSubmit = handleSubmit(async (data) => {
    const new_data: ShopRequestType = {
      _id: data._id,
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
        url: shop?.shop_image.url || '',
        public_id: shop?.shop_image.public_id || ''
      }
    }
    if (!file) {
      updateShopMutation.mutate(new_data, {
        onSuccess: async () => {
          toast.success('Cập nhật thông tin shop thành công')
          const drawer = document.getElementById('drawer-right-edit-shop')
          drawer?.classList.toggle('translate-x-full')
          await queryClient.invalidateQueries({
            queryKey: ['shopsData']
          })
        }
      })
    } else {
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
        form.append('publicId', shop?.shop_image.public_id || '')
        const uploadRes = await updateAvatar.mutateAsync(form)
        img = uploadRes.data.data
        await updateShopMutation.mutateAsync({ ...new_data, shop_image: img })
        const drawer = document.getElementById('drawer-right-edit-shop')
        drawer?.classList.toggle('translate-x-full')
        toast.success('Cập nhật thông tin shop thành công')
        await queryClient.invalidateQueries({
          queryKey: ['shopsData']
        })
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
        toast.error('Cập nhật thông tin shop thất bại')
      }
    }
  })
  return (
    <div className=''>
      <Helmet>
        <title>
          {shop && shop.shop_name ? shop.shop_name + ' | ' + 'TTFood-Partner' : 'TTFood - Dịch vụ đặt đồ ăn nhanh'}
        </title>
      </Helmet>
      {isLoading || isLoadingProvince || isLoadingDistricts || isLoadingWards ? (
        <div className={`container p-5 mx-auto flex ${showMenu ? 'overflow-hidden h-screen' : 'sm:overflow-auto'}`}>
          <div className='w-full flex flex-col'>
            <div className='w-full py-3 pl-7 pr-5 grid animate animate-pulse xl:grid-cols-12 lg:grid-cols-2 grid-cols-1 gap-5 justify-start h-[407px]'>
              <div className='p-5 xl:col-span-4 bg-white flex flex-col max-w-full 2xl:max-w-none w-full rounded-md gap-2 border border-[#E7E7E7] hover:shadow-md cursor-pointer'>
                <div className='flex items-center justify-center w-full h-full object-cover bg-gray-300 rounded dark:bg-gray-700'>
                  <svg
                    className='w-10 h-10 text-gray-200 dark:text-gray-600'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='currentColor'
                    viewBox='0 0 20 18'
                  >
                    <path d='M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z' />
                  </svg>
                </div>
              </div>
              <div className='p-5 xl:col-span-8 bg-white flex flex-col max-w-full 2xl:max-w-none w-full rounded-md gap-2 border border-[#E7E7E7] hover:shadow-md cursor-pointer'>
                <div className='flex mb-4 justify-between items-center'>
                  <div className='h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-48'></div>
                  <div className='h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-10'></div>
                </div>
                <hr />
                <div className='mt-4 space-y-10'>
                  {[...Array(7)].map((_, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <div className='h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-10'></div>
                      <div className='h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full max-w-[50px]'></div>
                      <div className={`h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`container mx-auto flex ${showMenu ? 'overflow-hidden h-screen' : 'sm:overflow-auto'}`}>
          <div className='w-full flex flex-col'>
            <div className='w-full py-3 pl-7 pr-5 grid xl:grid-cols-12 lg:grid-cols-2 grid-cols-1 gap-5 justify-start'>
              <div className='p-5 xl:col-span-4 bg-white flex flex-col max-w-full 2xl:max-w-none w-full rounded-md gap-2 border border-[#E7E7E7] hover:shadow-md cursor-pointer'>
                <img
                  src={shop?.shop_image.url || '/images/restaurant_default.svg'}
                  className='w-full h-full object-cover'
                  alt=''
                  loading='lazy'
                />
              </div>
              <div className='p-5 xl:col-span-8 bg-white flex flex-col max-w-full 2xl:max-w-none w-full rounded-md gap-2 border border-[#E7E7E7] hover:shadow-md cursor-pointer'>
                <div className='flex mb-4 justify-between items-center'>
                  <div className='text-base font-extrabold tracking-tight leading-none text-gray-900 md:text-base lg:text-lg dark:text-white'>
                    Thông tin shop
                  </div>
                  <button
                    onClick={() => {
                      setFile(undefined)
                      const drawer = document.getElementById('drawer-right-edit-shop')
                      drawer?.classList.toggle('translate-x-full')
                    }}
                  >
                    <svg
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      width={24}
                      height={24}
                      className='text-[#3899ec] cursor-pointer'
                    >
                      <path d='M16.679,5.60187506 L18.381,7.30587506 C19.207,8.13287506 19.207,9.47787506 18.381,10.3058751 L10.211,18.4858751 L4,19.9998751 L5.512,13.7818751 L13.682,5.60187506 C14.481,4.79987506 15.878,4.79887506 16.679,5.60187506 Z M8.66091072,16.0462125 L9.973,17.3598751 L15.625,11.7018751 L12.289,8.36087506 L6.637,14.0198751 L7.95422762,15.3386821 L11.1467061,12.1463747 C11.3419735,11.9511178 11.6585559,11.9511262 11.8538129,12.1463936 C12.0490698,12.341661 12.0490613,12.6582435 11.8537939,12.8535004 L8.66091072,16.0462125 Z M16.306,11.0198751 L17.7,9.62387506 C18.15,9.17287506 18.15,8.43787506 17.7,7.98687506 L15.998,6.28287506 C15.561,5.84587506 14.801,5.84687506 14.364,6.28287506 L12.97,7.67887506 L16.306,11.0198751 Z M5.426,18.5738751 L8.995,17.7438751 L6.254,14.9988751 L5.426,18.5738751 Z' />
                    </svg>
                  </button>
                  <div
                    id='drawer-right-edit-shop'
                    className='fixed top-[63px] right-0 z-[100] h-screen overflow-y-auto transition-transform translate-x-full bg-white w-96 dark:bg-gray-800'
                    tabIndex={-1}
                    aria-labelledby='drawer-right-label'
                  >
                    <div className='p-4'>
                      <h5
                        id='drawer-right-label'
                        className='inline-flex items-center text-xl font-semibold text-gray-900 dark:text-gray-400'
                      >
                        Chỉnh sửa thông tin shop
                      </h5>
                      <button
                        type='button'
                        onClick={() => {
                          const drawer = document.getElementById('drawer-right-edit-shop')
                          drawer?.classList.toggle('translate-x-full')
                        }}
                        aria-controls='drawer-right-edit-shop'
                        className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white'
                      >
                        <svg
                          className='w-3 h-3'
                          aria-hidden='true'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 14 14'
                        >
                          <path
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                          />
                        </svg>
                        <span className='sr-only'>Close menu</span>
                      </button>
                    </div>
                    <div className='h-[1px] w-full bg-gray-300 mb-5'></div>
                    <div className=''>
                      <FormProvider {...methods}>
                        <form noValidate onSubmit={onSubmit}>
                          <div className='flex flex-col px-5 h-96 overflow-y-scroll'>
                            <CommonInput
                              name='shop_name'
                              register={register}
                              type='text'
                              label='Tên shop'
                              classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                              requiredInput={true}
                              placeholder='Nhập tên shop của bạn'
                              className='mt-3'
                              errorMessage={errors.shop_name?.message}
                            />
                            <TextArea
                              name='description'
                              register={register}
                              type='text'
                              label='Mô tả shop'
                              classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                              requiredInput={true}
                              placeholder='Thêm thông tin mô tả về shop của bạn'
                              className='mt-3'
                              errorMessage={errors.description?.message}
                            />
                            <CommonInput
                              name='hotline'
                              register={register}
                              type='text'
                              label='Hotline'
                              classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                              requiredInput={true}
                              placeholder='Nhập số điện thoại của bạn'
                              className='mt-3'
                              errorMessage={errors.hotline?.message}
                            />
                            <div className='mt-3'>
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
                                <option value={ShopStyles.HOT_POT}>{ShopStyles.HOT_POT}</option>
                                <option value={ShopStyles.FOOD}>{ShopStyles.FOOD}</option>
                                <option value={ShopStyles.MILK_TEA}>{ShopStyles.MILK_TEA}</option>
                                <option value={ShopStyles.DESSERT}>{ShopStyles.DESSERT}</option>
                              </select>
                              <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                {fieldState.error?.message}
                              </div>
                            </div>
                            <div className='grid grid-cols-2 gap-3'>
                              <div>
                                <CommonInput
                                  name='open_time'
                                  register={register}
                                  type='time'
                                  label='Giờ mở cửa'
                                  classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                                  requiredInput={true}
                                  className='mt-3'
                                  errorMessage={errors.open_time?.message}
                                />
                              </div>
                              <div>
                                <CommonInput
                                  name='close_time'
                                  register={register}
                                  type='time'
                                  label='Giờ đóng cửa'
                                  classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                                  requiredInput={true}
                                  className='mt-3'
                                  errorMessage={errors.close_time?.message}
                                />
                              </div>
                            </div>
                            {/* Số nhà tên đường */}
                            <CommonInput
                              name='houseNumber_street'
                              register={register}
                              type='text'
                              label='Số nhà, tên đường'
                              classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                              requiredInput={true}
                              className='mt-3'
                              errorMessage={errors.houseNumber_street?.message}
                            />
                            {/* Tỉnh thành phố */}
                            <div className='mt-3'>
                              <Controller
                                name='province'
                                control={control}
                                defaultValue=''
                                render={({ field, fieldState }) => (
                                  <>
                                    <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                                      Tỉnh/Thành Phố <span className='text-red-500'>*</span>
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
                                    <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                      {fieldState.error?.message}
                                    </div>
                                  </>
                                )}
                              />
                            </div>
                            {/* Quận huyện */}
                            <div className='mt-3'>
                              <Controller
                                name='district'
                                control={control}
                                defaultValue=''
                                render={({ field, fieldState }) => (
                                  <>
                                    <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                                      Quận/Huyện <span className='text-red-500'>*</span>
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
                                    <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                      {fieldState.error?.message}
                                    </div>
                                  </>
                                )}
                              />
                            </div>
                            {/* Phường xã */}
                            <div className='mt-3'>
                              <Controller
                                name='ward'
                                control={control}
                                defaultValue=''
                                render={({ field, fieldState }) => (
                                  <>
                                    <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                                      Phường/Xã <span className='text-red-500'>*</span>
                                    </div>
                                    <select
                                      {...field}
                                      className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                                    >
                                      <option value=''>--Chọn phường/xã--</option>
                                      {wards?.map((ward) => (
                                        <option key={ward.ward_id} value={ward.ward_id}>
                                          {ward.ward_name}
                                        </option>
                                      ))}
                                    </select>
                                    <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                      {fieldState.error?.message}
                                    </div>
                                  </>
                                )}
                              />
                            </div>
                            <div className='flex flex-col items-center'>
                              <div className='text-gray-600 italic mb-3'>Chọn ảnh nền nhà hàng / quán ăn</div>
                              <InputFile
                                classNamesButton='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 flex gap-2 items-center'
                                onChange={handleChangeFile}
                              />
                              {shop?.shop_image.url && !file ? (
                                <div className='mt-3'>
                                  <img
                                    src={shop?.shop_image.url || '/images/restaurant_default.svg'}
                                    alt='preview'
                                    className='w-full h-full object-cover'
                                  />
                                </div>
                              ) : (
                                <div className='mt-3'>
                                  <img src={previewImage} alt='preview' className='w-full h-full object-cover' />
                                </div>
                              )}
                              <div className='mt-3 text-gray-400'>
                                <div>Dụng lượng file tối đa 1 MB</div>
                                <div>Định dạng:.JPEG, .PNG</div>
                              </div>
                            </div>
                          </div>
                          <div className='h-[1px] w-full bg-gray-300 mb-5'></div>
                          <div>
                            <div className='flex justify-end gap-x-3 px-5'>
                              <button
                                type='button'
                                onClick={() => {
                                  const drawer = document.getElementById('drawer-right-edit-shop')
                                  drawer?.classList.toggle('translate-x-full')
                                }}
                                className='px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
                              >
                                Hủy
                              </button>
                              {updateShopMutation.isPending || updateAvatar.isPending ? (
                                <button
                                  disabled
                                  type='button'
                                  className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center'
                                >
                                  <svg
                                    aria-hidden='true'
                                    role='status'
                                    className='inline w-4 h-4 me-3 text-white animate-spin'
                                    viewBox='0 0 100 101'
                                    fill='none'
                                    xmlns='http://www.w3.org/2000/svg'
                                  >
                                    <path
                                      d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                                      fill='#E5E7EB'
                                    />
                                    <path
                                      d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                                      fill='currentColor'
                                    />
                                  </svg>
                                  Loading...
                                </button>
                              ) : (
                                <button
                                  type='submit'
                                  className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center'
                                >
                                  <span className='me-2'>Lưu</span>
                                  <Save />
                                </button>
                              )}
                            </div>
                          </div>
                        </form>
                      </FormProvider>
                    </div>
                  </div>
                </div>
                <hr />
                <div className='mt-4 space-y-5'>
                  <div className='flex items-center gap-2'>
                    <UilShop />
                    <div className='text-sm md:text-base font-normal text-[#637381]'>Tên shop:</div>
                    <div className='text-sm md:text-base font-normal text-blue-600'>{shop?.shop_name}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <UilInfoCircle />
                    <div className='text-sm md:text-base font-normal text-[#637381]'>Mô tả: </div>
                    <div className='text-sm md:text-base font-normal text-blue-600 truncate w-full max-w-md'>
                      {shop?.description}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <UilPhone />
                    <div className='text-sm md:text-base font-normal text-[#637381]'>Hotline:</div>
                    <div className='text-sm md:text-base font-normal text-blue-600'>{shop?.hotline}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {shop?.shop_style === ShopStyles.FOOD && <UilUtensils />}
                    {shop?.shop_style === ShopStyles.BEVERAGE && <UilGlassMartini />}
                    {shop?.shop_style === ShopStyles.HOT_POT && <UilFire />}
                    <div className='text-sm md:text-base font-normal text-[#637381]'>Lĩnh vực: </div>
                    <div className='text-sm md:text-base font-normal text-blue-600'>{shop?.shop_style}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <UilClock />
                    <div className='text-sm md:text-base font-normal text-[#637381]'>Giờ hoạt động: </div>
                    <div className='text-sm md:text-base font-normal text-blue-600'>
                      {shop?.open_time} - {shop?.close_time}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <UilMap />
                    <div className='text-sm md:text-base font-normal text-[#637381]'>Địa chỉ:</div>
                    <div className='text-sm md:text-base font-normal text-blue-600'>
                      {shop?.shop_address.houseNumber_street},{' '}
                      {shopWardsData?.find((ward) => ward.ward_id === shop?.shop_address.ward)?.ward_name},{' '}
                      {
                        shopDictrictsData?.find((district) => district.district_id === shop?.shop_address.district)
                          ?.district_name
                      }
                      ,{' '}
                      {
                        shopProvincesData?.find((province) => province.province_id === shop?.shop_address.province)
                          ?.province_name
                      }
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <UilStar />
                    <div className='text-sm md:text-base font-normal text-[#637381]'>Đánh giá:</div>
                    <div className='text-sm md:text-base font-normal text-blue-600'>
                      {shop?.rating} {shop && shop.rating === 0 && '(Chưa có lượt đánh giá nào)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Shop
