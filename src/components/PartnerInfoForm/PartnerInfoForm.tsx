import { FC, useContext, useEffect, useMemo, useState } from 'react'
import { Controller, useController, useForm, FormProvider } from 'react-hook-form'
import { AppContext } from '~/contexts/app.context'
import { getActiveStepFromLS, setActiveStepToLS, setProfileToLS } from '~/utils/auth'
import CommonInput from '~/components/CommonInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormPartnerType, New_Form_Partner, partnerFormSchema } from '~/utils/rules'
import { useMutation, useQuery } from '@tanstack/react-query'
import { DistrictType, ProvinceType, WardType } from '~/types/address.type'
import InputFile from '~/components/InputFile'
import authApi from '~/apis/authApi'
import { isAxiosUnprocessableEntityError } from '~/utils/utils'
import { ErrorResponse } from '~/types/utils.type'
import Loading from '../Loading'

interface PartnerInfoFormProps {
  setActiveStep1: React.Dispatch<React.SetStateAction<boolean>>
}
const PartnerInfoForm: FC<PartnerInfoFormProps> = ({ setActiveStep1 }) => {
  const { activeStep, setActiveStep } = useContext(AppContext)
  const [file, setFile] = useState<File>()
  const { profile, setProfile } = useContext(AppContext)
  const initValues: FormPartnerType = {
    name: profile?.name || '',
    phone: profile?.phone || '',
    date_of_birth: '',
    district: '',
    email: profile?.email || '',
    gender: '',
    houseNumber_street: '',
    identity_number: '',
    province: '',
    ward: ''
  }
  const methods = useForm<FormPartnerType>({
    resolver: yupResolver(partnerFormSchema),
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
    name: 'gender',
    control,
    defaultValue: ''
  })
  const uploadAvatarMutaion = useMutation({
    mutationFn: async (form: FormData) => authApi.uploadAvatar(form)
  })
  const updateProfileMutation = useMutation({
    mutationFn: async (data: New_Form_Partner) => authApi.updateProfile(data)
  })
  const { data: profileData } = useQuery({
    queryKey: ['profile', profile?._id],
    queryFn: () => authApi.getProfile(),
    enabled: !!profile?._id
  })
  const onSubmit = handleSubmit(async (data) => {
    const new_data: New_Form_Partner = {
      name: data.name,
      phone: data.phone,
      email: profile?.email || '',
      identity_number: data.identity_number,
      date_of_birth: data.date_of_birth,
      address: {
        province: data.province,
        district: data.district,
        ward: data.ward,
        houseNumber_street: data.houseNumber_street
      },
      gender: data.gender,
      avatar: {
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
      if (file) {
        const form = new FormData()
        form.append('avatar', file)
        const uploadRes = await uploadAvatarMutaion.mutateAsync(form)
        img = uploadRes.data.data
      }
      const res = await updateProfileMutation.mutateAsync({ ...new_data, avatar: img })
      setProfile(res.data.data)
      setProfileToLS(res.data.data)
      setActiveStepToLS([true, activeStep[1], activeStep[2], activeStep[3]])
      setActiveStep([true, activeStep[1], activeStep[2], activeStep[3]])
      setActiveStep1(false)
    } catch (error) {
      if (isAxiosUnprocessableEntityError<ErrorResponse<FormPartnerType>>(error)) {
        const formError = error.response?.data.errors
        if (formError) {
          Object.keys(formError).forEach((key) => {
            setError(key as keyof FormPartnerType, {
              message: formError[key as keyof FormPartnerType],
              type: 'Server'
            })
          })
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
      {uploadAvatarMutaion.isPending || updateProfileMutation.isPending ? (
        <Loading />
      ) : (
        <div className='grid gap-4 gap-y-2 animate__animated animate__fadeIn text-sm grid-cols-1 lg:grid-cols-2'>
          <div className='lg:col-span-2'>
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} noValidate>
                <div className='grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6'>
                  <div className='md:col-span-6'>
                    <div className='flex justify-center md:w-72 md:border-l md:border-l-gray-200'>
                      <div className='flex flex-col items-center'>
                        <div className='my-5 h-24 w-24'>
                          <img
                            src={previewImage || '/images/avatar_default.svg'}
                            alt=''
                            className='h-full w-full rounded-full object-cover'
                          />
                        </div>
                        <InputFile onChange={handleChangeFile} />
                        <div className='mt-3 text-gray-400'>
                          <div>Dụng lượng file tối đa 1 MB</div>
                          <div>Định dạng:.JPEG, .PNG</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='md:col-span-4'>
                    <CommonInput
                      name='name'
                      register={register}
                      type='text'
                      label='Họ tên'
                      requiredInput={true}
                      placeholder='Vinh Bá Hùng'
                      className='mt-3'
                      errorMessage={errors.name?.message}
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <CommonInput
                      name='phone'
                      register={register}
                      type='tel'
                      className='mt-3'
                      errorMessage={errors.phone?.message}
                      placeholder='0397706494'
                      label='Số điện thoại'
                      requiredInput={true}
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <CommonInput
                      name='date_of_birth'
                      register={register}
                      type='date'
                      className='mt-3'
                      errorMessage={errors.date_of_birth?.message}
                      label='Ngày sinh'
                      requiredInput={true}
                    />
                  </div>
                  <div className='md:col-span-2 mt-3'>
                    <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                      Giới tính <span className='text-red-500'>*</span>
                    </div>
                    <select
                      {...field}
                      className='p-3 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                    >
                      <option value='' disabled>
                        Chọn giới tính
                      </option>
                      <option value='Nam'>Nam</option>
                      <option value='Nữ'>Nữ</option>
                      <option value='Khác'>Khác</option>
                    </select>
                    <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{fieldState.error?.message}</div>
                  </div>
                  <div className='md:col-span-2'>
                    <CommonInput
                      name='identity_number'
                      register={register}
                      type='number'
                      className='mt-3'
                      errorMessage={errors.identity_number?.message}
                      placeholder='036093002023'
                      label='CCCD / CMND'
                      requiredInput={true}
                    />
                  </div>
                  <div className='md:col-span-3'>
                    <CommonInput
                      name='email'
                      register={register}
                      disabled={true}
                      type='email'
                      className='mt-3'
                      errorMessage={errors.email?.message}
                      label='Địa chỉ email'
                      requiredInput={true}
                      placeholder='vbhung1@gmail.com'
                    />
                  </div>
                  <div className='md:col-span-3'>
                    <CommonInput
                      name='houseNumber_street'
                      register={register}
                      type='text'
                      className='mt-3'
                      errorMessage={errors.houseNumber_street?.message}
                      label='Số nhà / Tên đường'
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
export default PartnerInfoForm
