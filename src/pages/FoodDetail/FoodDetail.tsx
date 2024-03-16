import React from 'react'
import useQueryParams from '~/hooks/useQueryParams'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FOOD_API } from '~/apis/food.api'
import { Food } from '~/types/food.type'
import { MoreHorizontal, Save, Trash2 } from 'lucide-react'
import InputFile from '~/components/InputFile'
import authApi from '~/apis/authApi'
import SelectMutipleInput from '~/components/SelectMutipleInput'
import { FormProvider, useController, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { foodSchema } from '~/schemas/food.schema'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import CommonInput from '~/components/CommonInput'
import Loading from '~/components/Loading'
import { DiscountType, SellingStatus } from '~/enums'
import { formatCurrency } from '~/utils/utils'
import { FOOD_OPTIONS_API } from '~/apis/food_options.api'
import { FoodOptions } from '~/types/food_options.type'
import { UilPlus, UilTrash } from '@iconscout/react-unicons'
import Modal from '~/components/Modal'
import { foodOptionSchema } from '~/schemas/food_options.schema'
import classNames from 'classnames'
import { NavLink, useNavigate } from 'react-router-dom'
import { partnerPaths } from '~/routes/partnerRoute'
import { MenuSection } from '~/types/menu_section.type'
import Toast from '~/components/Toast'
import { AxiosError } from 'axios'
import TextArea from '~/components/AreaInput'
import ModalZoom from '~/components/ModalZoom'

const FoodDetail: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = React.useState<any>(null)
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = React.useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    is_open: boolean
  }>({
    message: 'Thông báo mẫu',
    type: 'success',
    is_open: false
  })
  const queryParams = useQueryParams()
  const { data, isLoading } = useQuery({
    queryKey: ['foodDetail', queryParams.id],
    queryFn: () => FOOD_API.getById(queryParams.id),
    enabled: !!queryParams.id
  })
  const food = data?.data?.data as Food
  const { data: menuSectionData, isLoading: loadingMenuSectionData } = useQuery({
    queryKey: ['menuSectionData', food?.menu_section_id],
    queryFn: () => authApi.getMenuSectionById(food?.menu_section_id),
    enabled: !!food?.menu_section_id
  })
  const navigate = useNavigate()
  const menuSection = menuSectionData?.data?.data as MenuSection
  // const { data: dataCategories } = useQuery({
  //   queryKey: ['dataCategories'],
  //   queryFn: () => authApi.getCategories()
  // })
  // // Fetch all food categories by shop id
  // const { data: foodCategoriesData } = useQuery({
  //   queryKey: ['foodCategoriesData', food?._id],
  //   queryFn: () => authApi.getFoodCategories(food?._id),
  //   enabled: !!food?._id,
  //   refetchOnWindowFocus: true
  // })
  const { data: foodOptionsData, isLoading: loadingFoodOptionsData } = useQuery({
    queryKey: ['foodOptionsData', food?._id],
    queryFn: () => FOOD_OPTIONS_API.getAllByFoodId(food?._id),
    enabled: !!food?._id
  })
  const [options, setOptions] = React.useState<FoodOptions[]>([])
  const [isOpenModalDeleteFood, setIsOpenModalDeleteFood] = React.useState<boolean>(false)
  const methodsFood = useForm({
    resolver: yupResolver(foodSchema)
  })
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = methodsFood
  const { field, fieldState } = useController({
    name: 'discount_type',
    control,
    defaultValue: food?.discount.type
  })
  const updateFoodImageMutation = useMutation({
    mutationFn: (data: FormData) => authApi.updateAvatar(data)
  })
  const updateFoodMutation = useMutation({
    mutationFn: (data: Food & { categories: string[]; food_options: FoodOptions[] }) => FOOD_API.update(data)
  })
  const deleteFoodByIdMutation = useMutation({
    mutationFn: (id: string) => FOOD_API.delete(id)
  })
  const onSubmit = handleSubmit(async (data) => {
    try {
      const categories = (selectedOptions as { value: string; label: string }[])?.map((option) => option.value) || []

      if (categories.length === 0) {
        throw new Error('Vui lòng chọn loại món ăn')
      }
      let selling_status: SellingStatus = SellingStatus.IN_STORE
      if (!data.is_selling) {
        selling_status = SellingStatus.IN_STORE
      } else {
        // true
        if (food.is_selling === SellingStatus.IN_STORE)  {
          selling_status = SellingStatus.WAITING
        } else {
          selling_status = food.is_selling
        }
      }
      const foodData: Food & { categories: string[]; food_options: FoodOptions[] } = {
        ...data,
        _id: food?._id,
        favorites: food.favorites,
        categories,
        food_options: options,
        sold: food.sold,
        cost_of_goods_sold: data.cost_of_goods_sold,
        menu_section_id: food.menu_section_id,
        created_at: food.created_at,
        updated_at: food.updated_at,
        shop_id: food.shop_id,
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        discount: {
          status: data.discount_status,
          type: data.discount_type as DiscountType,
          value: data.discount_value || 0
        },
        publish_status: data.publish_status,
        is_selling: selling_status,
        image: {
          url: food.image.url,
          public_id: food.image.public_id
        }
      }
      if (file) {
        const formData = new FormData()
        formData.append('avatar', file)
        formData.append('publicId', food?.image.public_id)

        const result = await updateFoodImageMutation.mutateAsync(formData)

        if (!result.data.data) {
          throw new Error('Lỗi cập nhật ảnh món ăn')
        }

        await updateFoodMutation.mutateAsync({ ...foodData, image: result.data.data })
      } else {
        await updateFoodMutation.mutateAsync(foodData)
      }
      setShowToast({
        message: 'Cập nhật món ăn thành công',
        type: 'success',
        is_open: true
      })
      setTimeout(() => {
        setShowToast({
          message: '',
          type: 'success',
          is_open: false
        })
      }, 3000)
      await queryClient.invalidateQueries({ queryKey: ['foodDetail'] })

      updateFoodMutation.reset()
    } catch (error) {
      const err = error as AxiosError
      setShowToast({
        message: err.message || 'Lỗi cập nhật món ăn',
        type: 'error',
        is_open: true
      })
      setTimeout(() => {
        setShowToast({
          message: '',
          type: 'error',
          is_open: false
        })
      }, 3000)
    }
  })

  const [file, setFile] = React.useState<File>()
  const handleChangeFile = (file?: File) => {
    setFile(file)
  }
  const previewImage = React.useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])
  React.useEffect(() => {
    if (food) {
      let selling_status = false
      if (food.is_selling === SellingStatus.IN_STORE) selling_status = false
      if (food.is_selling === SellingStatus.APPROVED) selling_status = true
      if (food.is_selling === SellingStatus.REJECTED) selling_status = false
      if (food.is_selling === SellingStatus.WAITING) selling_status = true
      methodsFood.reset({
        _id: food._id,
        description: food.description,
        name: food.name,
        discount_status: food.discount.status,
        discount_value: food.discount.value,
        price: food.price,
        cost_of_goods_sold: food.cost_of_goods_sold,
        publish_status: food.publish_status,
        discount_type: food.discount.type,
        quantity: food.quantity,
        is_selling: selling_status
      })
    }
    if (foodOptionsData) {
      setOptions(foodOptionsData.data.data)
    }
  }, [food, foodOptionsData, methodsFood])
  const handlePrice = () => {
    const price = watch('price')
    const isDiscount = watch('discount_status') as boolean
    const discountType = watch('discount_type') as DiscountType
    const discountValue = watch('discount_value') || 0
    if (isDiscount) {
      if (discountType === ('' as DiscountType)) {
        return formatCurrency(price)
      } else if (discountType === DiscountType.PERCENTAGE) {
        return formatCurrency(price - (price * discountValue) / 100)
      } else {
        return formatCurrency(price - discountValue)
      }
    }
  }
  const handleProfit = () => {
    const price = watch('price')
    const costOfGoodsSold = watch('cost_of_goods_sold')
    const isDiscount = watch('discount_status') as boolean
    const discountType = watch('discount_type') as DiscountType
    const discountValue = watch('discount_value') || 0
    if (isDiscount) {
      if (discountType === ('' as DiscountType)) {
        return formatCurrency(price - costOfGoodsSold)
      } else if (discountType === DiscountType.PERCENTAGE) {
        return formatCurrency(price - (price * discountValue) / 100 - costOfGoodsSold)
      } else {
        return formatCurrency(price - discountValue - costOfGoodsSold)
      }
    } else {
      return formatCurrency(price - costOfGoodsSold)
    }
  }
  const handleMarginPricePercentage = () => {
    const price = watch('price')
    const costOfGoodsSold = watch('cost_of_goods_sold')
    const isDiscount = watch('discount_status') as boolean
    const discountType = watch('discount_type') as DiscountType
    const discountValue = watch('discount_value') || 0
    if (isDiscount) {
      if (discountType === ('' as DiscountType)) {
        return formatCurrency(((price - costOfGoodsSold) / price) * 100)
      } else if (discountType === DiscountType.PERCENTAGE) {
        return formatCurrency(((price - (price * discountValue) / 100 - costOfGoodsSold) / price) * 100)
      } else {
        return formatCurrency(((price - discountValue - costOfGoodsSold) / price) * 100)
      }
    } else {
      return formatCurrency(((price - costOfGoodsSold) / price) * 100)
    }
  }
  const [openModalAddFoodOptions, setOpenModalAddFoodOptions] = React.useState(false)
  const [indexEditFoodOptionItem, setIndexEditFoodOptionItem] = React.useState(-1)
  const [additionalForms, setAdditionalForms] = React.useState<
    {
      name: string
      price: number
    }[]
  >([
    {
      name: '',
      price: 0
    }
  ])
  const [isSingleSelect, setIsSingleSelect] = React.useState(false)
  const [editAdditionalForm, setEditAdditionalForm] = React.useState<
    {
      _id?: string
      name: string
      price: number
      food_option_id?: string
      created_at?: string
      updated_at?: string
    }[]
  >([])
  const methodsFormFoodOptions = useForm({
    resolver: yupResolver(foodOptionSchema)
  })
  const {
    handleSubmit: handleSubmitFormFoodOptions,
    register: registerFormFoodOptions,
    reset: resetFormFoodOptions,
    formState: { errors: errorsFormFoodOptions }
  } = methodsFormFoodOptions
  const handleAddFoodOptions = handleSubmitFormFoodOptions((data) => {
    if (indexEditFoodOptionItem === -1) {
      const newOptions: FoodOptions = {
        name: data.name,
        isSingleSelect: isSingleSelect,
        food_id: food._id,
        options: additionalForms
      }
      options.push(newOptions)
      setOpenModalAddFoodOptions(false)
      setAdditionalForms([
        {
          name: '',
          price: 0
        }
      ])
      setIsSingleSelect(true)
      resetFormFoodOptions()
      setIndexEditFoodOptionItem(-1)
    } else {
      const editOptions: FoodOptions = {
        _id: options[indexEditFoodOptionItem]._id,
        name: data.name,
        food_id: food._id,
        isSingleSelect: isSingleSelect,
        options: editAdditionalForm
      }
      options[indexEditFoodOptionItem] = editOptions
      setOpenModalAddFoodOptions(false)
      setAdditionalForms([
        {
          name: '',
          price: 0
        }
      ])
      setIsSingleSelect(true)
      resetFormFoodOptions()
      setIndexEditFoodOptionItem(-1)
    }
  })
  const addNewForm = () => {
    setAdditionalForms([...additionalForms, { name: '', price: 0 }])
  }
  const addNewFormEdit = () => {
    setEditAdditionalForm([...editAdditionalForm, { name: '', price: 0 }])
  }
  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const values = [...additionalForms]
    if (event.target.name === 'name') {
      values[index].name = event.target.value
    } else {
      values[index].price = parseFloat(event.target.value)
    }
    setAdditionalForms(values)
  }
  const handleInputChangeEdit = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const values = [...editAdditionalForm]
    if (event.target.name === 'name') {
      values[index].name = event.target.value
    } else {
      values[index].price = parseFloat(event.target.value)
    }
    setEditAdditionalForm(values)
  }
  const deleteForm = (index: number) => {
    const values = [...additionalForms]
    values.splice(index, 1)
    setAdditionalForms(values)
  }
  const deleteFormEdit = (index: number) => {
    const values = [...editAdditionalForm]
    values.splice(index, 1)
    setEditAdditionalForm(values)
  }
  const handleEditFoodOption = (index: number) => {
    setIndexEditFoodOptionItem(index)
    methodsFormFoodOptions.reset({
      name: options[index].name
    })

    const editForm = JSON.parse(JSON.stringify(options[index].options)) as {
      _id?: string | undefined
      name: string
      price: number
      food_option_id?: string | undefined
      created_at?: string | undefined
      updated_at?: string | undefined
    }[]
    setEditAdditionalForm(editForm)
    setIsSingleSelect(options[index].isSingleSelect)
    setOpenModalAddFoodOptions(true)
  }
  const handleClickAddNewFoodOption = () => {
    setIndexEditFoodOptionItem(-1)
    methodsFormFoodOptions.reset({
      name: ''
    })
    setIsSingleSelect(true)
    setAdditionalForms([
      {
        name: '',
        price: 0
      }
    ])
    setOpenModalAddFoodOptions(true)
  }
  const deleteFoodOption = (index: number) => {
    options.splice(index, 1)
    setOptions([...options])
  }
  const handleDeleteFood = (id: string) => {
    deleteFoodByIdMutation.mutate(id, {
      onSuccess: async () => {
        setIsOpenModalDeleteFood(false)
        await queryClient.invalidateQueries({ queryKey: ['dataFoodItems'] })
        navigate(partnerPaths.menu)
      }
    })
  }
  if (isLoading || loadingFoodOptionsData || deleteFoodByIdMutation.isPending) return <Loading></Loading>
  return (
    <div className='container mx-auto pl-10 pr-5 py-5'>
      <FormProvider {...methodsFood}>
        <form noValidate onSubmit={onSubmit}>
          <header className='fixed z-[10] bg-[#F6F8FA] h-16 top-[63px] left-0 md:left-[255px] right-0 px-5'>
            <div className='flex justify-between items-center h-full'>
              <div className='flex items-center space-x-2'>
                <nav className='flex' aria-label='Breadcrumb'>
                  <ol className='inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse'>
                    <li className='inline-flex items-center'>
                      <NavLink
                        to={partnerPaths.menu}
                        className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white bg-transparent'
                      >
                        Menu
                      </NavLink>
                    </li>
                    <li>
                      <div className='flex items-center'>
                        <svg
                          className='rtl:rotate-180 w-3 h-3 text-gray-400 mx-1'
                          aria-hidden='true'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 6 10'
                        >
                          <path
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='m1 9 4-4-4-4'
                          />
                        </svg>
                        <NavLink
                          to={partnerPaths.menu}
                          className='inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white bg-transparent'
                        >
                          {menuSection?.name}
                        </NavLink>
                      </div>
                    </li>
                    <li aria-current='page'>
                      <div className='flex items-center'>
                        <svg
                          className='rtl:rotate-180 w-3 h-3 text-gray-400 mx-1'
                          aria-hidden='true'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 6 10'
                        >
                          <path
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='m1 9 4-4-4-4'
                          />
                        </svg>
                        <span className='ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400'>
                          {food.name}
                        </span>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setIsOpenModalDeleteFood(true)}
                  className='px-10 flex justify-center items-center text-red-600 hover:bg-red-50 py-2 rounded-md border border-white'
                  type='button'
                >
                  <Trash2></Trash2>
                </button>
                <button
                  type='button'
                  onClick={() => navigate(partnerPaths.menu)}
                  className='flex justify-center bg-white items-center border-white border rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white px-10  w-10 h-10 cursor-pointer'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  className='flex justify-center items-center border-white border rounded-xl bg-blue-600 px-10  w-10 h-10 cursor-pointer text-white hover:bg-blue-500'
                >
                  <span>Lưu</span>
                </button>
              </div>
            </div>
          </header>
          {updateFoodMutation.isPending && <Loading></Loading>}
          {updateFoodImageMutation.isPending && <Loading></Loading>}
          <main className='grid grid-cols-1 xl:grid-cols-12 gap-10 mt-[63px]'>
            <div className='col-span-8 rounded-xl '>
              <div className='flex flex-col gap-y-10'>
                <div className='bg-white py-5 rounded-xl'>
                  <div className='px-3 font-bold text-xl leading-6 mb-5'>Hình ảnh sản phẩm</div>
                  <hr />
                  <div className='flex px-3 items-center mt-5'>
                    {file ? (
                      <img src={previewImage} alt='preview' className='w-40 me-5 h-40 rounded-md object-cover' />
                    ) : (
                      <img src={food.image.url} alt='preview' className='w-40 h-40 me-5 rounded-md object-cover' />
                    )}
                    <InputFile onChange={handleChangeFile}></InputFile>
                  </div>
                </div>
                <div className='bg-white py-5 rounded-xl'>
                  <div className='px-3 font-bold text-xl leading-6 mb-5'>Thông tin món ăn</div>
                  <hr />
                  <div className='px-3 mt-5'>
                    <div>
                      <CommonInput
                        name='name'
                        register={register}
                        type='text'
                        label='Tên món ăn'
                        classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                        requiredInput={true}
                        placeholder='Gỏi cuốn, Phở, Bún chả vv.'
                        className='mt-3'
                        errorMessage={errors.name?.message}
                      />
                    </div>
                    {/* <div className='mb-3'>
                      <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                        Mô tả món ăn
                      </div>
                      <CKEditor
                        editor={ClassicEditor}
                        disableWatchdog
                        data={food?.description}
                        onChange={(_, editor) => methodsFood.setValue('description', editor.getData().trim())}
                      />
                      <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{errors.description?.message}</div>
                    </div> */}
                    <div>
                      <TextArea
                        name='description'
                        register={register}
                        type='text'
                        label='Mô tả món ăn'
                        classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                        requiredInput={true}
                        placeholder='Mô tả món ăn'
                        className='mt-3'
                        errorMessage={errors.description?.message}
                      />
                    </div>
                  </div>
                </div>
                <div className='bg-white py-5 rounded-xl'>
                  <div className='px-3 font-bold text-xl leading-6 mb-5'>Chính sách giá</div>
                  <hr />
                  <div className='px-3 mt-5'>
                    <div className=''>
                      <div className='w-40 relative'>
                        <CommonInput
                          name='price'
                          register={register}
                          type='number'
                          label='Giá'
                          classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                          requiredInput={true}
                          className='mt-3'
                          errorMessage={errors.price?.message}
                        />
                        <div className='text-blue-600 absolute top-[43%] text-base right-5'>đ</div>
                      </div>
                      <label className='inline-flex items-center cursor-pointer'>
                        <CommonInput
                          id='discount_status'
                          name='discount_status'
                          register={register}
                          type='checkbox'
                          toggleButton={true}
                          classNameInput='peer sr-only'
                        ></CommonInput>
                        <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300'>Giảm giá</span>
                      </label>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        {methodsFood.watch('discount_status') && (
                          <>
                            <div className='col-span-1 mt-3'>
                              <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                                Loại giảm giá
                              </div>
                              <select
                                {...field}
                                className='px-3 py-3.5 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                              >
                                <option value='' disabled>
                                  Chọn loại giảm giá
                                </option>
                                <option value={DiscountType.PERCENTAGE}>Phần trăm (%)</option>
                                <option value={DiscountType.AMOUNT}>Số tiền (đ)</option>
                              </select>
                              <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>
                                {fieldState.error?.message}
                              </div>
                            </div>
                            <div className='col-span-1'>
                              <CommonInput
                                name='discount_value'
                                register={register}
                                type='number'
                                min={0}
                                label='Giá trị giảm'
                                classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                                placeholder=''
                                className='mt-3'
                                errorMessage={errors.discount_value?.message}
                              />
                            </div>
                            <div className='col-span-1 mt-3'>
                              <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                                Giá bán rẻ
                              </div>
                              <div className='relative'>
                                <div className='px-3 py-3.5 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm bg-gray-100'>
                                  {handlePrice()}
                                </div>
                                <div className='absolute top-1/4 right-5 text-blue-600'>đ</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        <CommonInput
                          name='cost_of_goods_sold'
                          register={register}
                          type='number'
                          label='Giá vốn món ăn'
                          classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                          requiredInput={true}
                          className='mt-3'
                          errorMessage={errors.cost_of_goods_sold?.message}
                        />
                        <div className='col-span-1 mt-3'>
                          <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                            Lợi nhuận
                          </div>
                          <div className='relative'>
                            <div className='px-3 py-3.5 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm bg-gray-100'>
                              {handleProfit()}
                            </div>
                            <div className='absolute top-1/4 right-5 text-blue-600'>đ</div>
                          </div>
                        </div>
                        <div className='col-span-1 mt-3'>
                          <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                            Biên lợi
                          </div>
                          <div className='relative'>
                            <div className='px-3 py-3.5 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm bg-gray-100'>
                              {handleMarginPricePercentage()}
                            </div>
                            <div className='absolute top-1/4 right-5 text-blue-600'>%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-white py-5 rounded-xl'>
                  <div className='px-3 font-bold text-xl leading-6 mb-5'>Tùy chọn món ăn</div>
                  <p className='px-3 text-base mb-5'>Quản lý các tùy chọn của món ăn này.</p>
                  <hr />
                  <div className=''>
                    {options?.map((option, index) => {
                      return (
                        <div key={index} className='hover:bg-blue-50 cursor-pointer'>
                          <div className='grid grid-cols-1 gap-5 px-3 py-3.5 md:grid-cols-12'>
                            <div className='col-span-1 text-center self-center'>
                              {option.isSingleSelect ? 'Chọn 1' : `Chọn ${option.options.length} `}
                            </div>
                            <div className='col-span-4 flex flex-wrap font-bold text-base text-gray-900'>
                              {option.name}
                            </div>
                            <div className='col-span-5 flex flex-wrap gap-2 items-center'>
                              {option.options.map((item, index) => {
                                return (
                                  <div key={index} className='flex items-center gap-3'>
                                    <div>{item.name}</div>
                                    <span> - </span>
                                    <div className='font-bold text-blue-400'>{item.price}đ</div>
                                  </div>
                                )
                              })}
                            </div>
                            <div className='col-span-2 flex items-center justify-center gap-2'>
                              <button
                                onClick={() => handleEditFoodOption(index)}
                                type='button'
                                className='text-blue-600 hover:text-blue-400'
                              >
                                <svg viewBox='0 0 24 24' fill='currentColor' width={24} height={24}>
                                  <path d='M16.679,5.60187506 L18.381,7.30587506 C19.207,8.13287506 19.207,9.47787506 18.381,10.3058751 L10.211,18.4858751 L4,19.9998751 L5.512,13.7818751 L13.682,5.60187506 C14.481,4.79987506 15.878,4.79887506 16.679,5.60187506 Z M8.66091072,16.0462125 L9.973,17.3598751 L15.625,11.7018751 L12.289,8.36087506 L6.637,14.0198751 L7.95422762,15.3386821 L11.1467061,12.1463747 C11.3419735,11.9511178 11.6585559,11.9511262 11.8538129,12.1463936 C12.0490698,12.341661 12.0490613,12.6582435 11.8537939,12.8535004 L8.66091072,16.0462125 Z M16.306,11.0198751 L17.7,9.62387506 C18.15,9.17287506 18.15,8.43787506 17.7,7.98687506 L15.998,6.28287506 C15.561,5.84587506 14.801,5.84687506 14.364,6.28287506 L12.97,7.67887506 L16.306,11.0198751 Z M5.426,18.5738751 L8.995,17.7438751 L6.254,14.9988751 L5.426,18.5738751 Z' />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteFoodOption(index)}
                                type='button'
                                className='text-red-600 hover:text-red-400'
                              >
                                <UilTrash size={20}></UilTrash>
                              </button>
                            </div>
                          </div>
                          <hr />
                        </div>
                      )
                    })}
                  </div>
                  <hr />
                  <button
                    type='button'
                    onClick={() => handleClickAddNewFoodOption()}
                    className='flex items-center px-3 py-3.5 text-blue-600 hover:text-blue-400'
                  >
                    <UilPlus size={20} className='me-1'></UilPlus>
                    <span>Thêm một tùy chọn khác</span>
                  </button>
                </div>
              </div>
            </div>
            <div className='col-span-4 flex flex-col gap-y-10'>
              <div className='py-5 bg-white rounded-xl'>
                <div className='font-bold text-xl leading-6 px-3 mb-5'>Publish Store</div>
                <hr />
                <div className='flex flex-col px-3'>
                  <label className='inline-flex items-center cursor-pointer'>
                    <CommonInput id='is_public' name='publish_status' register={register} type='checkbox'></CommonInput>
                    <span className='ms-3 text-base font-medium text-gray-900 dark:text-gray-300'>
                      Hiển thị món ăn trong cửa hàng
                    </span>
                  </label>
                  <label className='inline-flex items-center cursor-pointer'>
                    <CommonInput id='is_selling' name='is_selling' register={register} type='checkbox'></CommonInput>
                    <span className='ms-3 text-base font-medium text-gray-900 dark:text-gray-300'>
                      Đăng bán món ăn trên{' '}
                      <span className='font-bold'>
                        TTFo<span className='text-apps-pink'>o</span>d
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              <div className='py-5 bg-white rounded-xl'>
                <div className='font-bold text-xl leading-6 px-3 mb-5'>Danh mục</div>
                <hr />
                <div className='flex flex-col gap-y-5 px-3 md:gap-y-2'>
                  <div className='mt-5'>
                    <SelectMutipleInput food_id={food._id} setSelectedOptions={setSelectedOptions} />
                  </div>
                </div>
              </div>
              <div className='py-5 bg-white rounded-xl'>
                <div className='font-bold text-xl leading-6 px-3 mb-5'>Theo dõi số lượng và lượt bán</div>
                <hr />
                <div className='flex flex-col gap-y-5 px-3 md:gap-y-2'>
                  <div className='mt-5'>
                    <CommonInput
                      name='quantity'
                      register={register}
                      type='number'
                      label='Số lượng'
                      classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                      requiredInput={true}
                      className='mt-3'
                      errorMessage={errors.quantity?.message}
                    />
                  </div>
                  <div className='mt-3'>
                    <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                      Đã bán
                    </div>
                    <div className='relative'>
                      <div className='px-3 py-3.5 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm bg-gray-100'>
                        {food?.sold}
                      </div>
                    </div>
                  </div>
                  <div className='mt-3'>
                    <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                      Số lượng món ăn còn lại
                    </div>
                    <div className='relative'>
                      <div className='px-3 py-3.5 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm bg-gray-100'>
                        {food?.quantity - food?.sold}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </form>
      </FormProvider>
      {/* Modal edit or create food option */}
      <Modal
        showDialog={openModalAddFoodOptions}
        width='max-w-3xl'
        children={
          <div className='py-2'>
            <div className='flex px-4 py-2.5 md:px-5 justify-between items-center'>
              <div>
                {indexEditFoodOptionItem === -1 ? (
                  <h5 className='text-xl font-bold text-gray-900 dark:text-gray-400'>Thêm tùy chọn món ăn</h5>
                ) : (
                  <h5 className='text-xl font-bold text-gray-900 dark:text-gray-400'>Chỉnh sửa tùy chọn món ăn</h5>
                )}
              </div>
              {/* add button close */}
              <button
                type='button'
                onClick={() => setOpenModalAddFoodOptions(false)}
                className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8  inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white'
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
            <div className='px-4 py-2.5 md:px-5'>
              <FormProvider {...methodsFormFoodOptions}>
                <form noValidate onSubmit={handleAddFoodOptions}>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10'>
                    <CommonInput
                      name='name'
                      register={registerFormFoodOptions}
                      type='text'
                      label='Nhập tên của tùy chọn'
                      classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                      requiredInput={true}
                      placeholder='Miếng gà giòn không xương ....'
                      className='mt-3'
                      autoComplete='off'
                      errorMessage={errorsFormFoodOptions.name?.message}
                    />
                    <div className='mt-3'>
                      <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                        Số lượt chọn tối đa
                      </div>
                      <div className=''>
                        <div className='inline-flex rounded-md shadow-sm' role='group'>
                          <button
                            type='button'
                            onClick={() => setIsSingleSelect(true)}
                            className={classNames(
                              'px-3 py-3.5 text-base font-medium rounded-s-md bg-transparent border  shadow-sm focus:z-10  dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700',
                              {
                                'border-blue-400 text-blue-600 ring-1': isSingleSelect,
                                'border-gray-300 text-gray-900': !isSingleSelect
                              }
                            )}
                          >
                            Chọn 1
                          </button>
                          <button
                            type='button'
                            onClick={() => setIsSingleSelect(false)}
                            className={classNames(
                              'px-3 py-3.5 text-base font-medium rounded-e-md bg-transparent border shadow-sm focus:z-10 dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700',
                              {
                                'border-blue-400 text-blue-600 ring-1': !isSingleSelect,
                                'border-gray-300 text-gray-900': isSingleSelect
                              }
                            )}
                          >
                            Chọn nhiều
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />
                  {indexEditFoodOptionItem === -1 && (
                    <div>
                      <button
                        type='button'
                        className='flex items-center mt-5 text-blue-600 hover:text-blue-400'
                        onClick={addNewForm}
                      >
                        <UilPlus />
                        <span>Thêm</span>
                      </button>
                      <div className='h-52 overflow-scroll'>
                        {additionalForms.map((form, index) => (
                          <div
                            key={index}
                            className='grid grid-cols-1 md:grid-cols-8 gap-5 md:gap-10 border border-dashed border-blue-400 mt-5 py-5'
                          >
                            <div className='items-center justify-center col-span-1 flex'>{index + 1}</div>
                            <div className='col-span-4'>
                              <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3'>
                                Loại tùy chọn
                              </div>
                              <input
                                type='text'
                                name='name'
                                className='px-3 py-3.5 w-full outline-none border border-gray-300 mt-3 focus:border-gray-500 rounded-md focus:shadow-sm'
                                placeholder='Không cay'
                                autoComplete='off'
                                value={form.name}
                                onChange={(e) => handleInputChange(index, e)}
                              />
                            </div>
                            <div className='col-span-2'>
                              <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3'>
                                Giá tiền
                              </div>
                              <input
                                type='number'
                                name='price'
                                className='px-3 py-3.5 w-full outline-none border border-gray-300 mt-3 focus:border-gray-500 rounded-md focus:shadow-sm'
                                placeholder='0đ'
                                autoComplete='off'
                                value={form.price}
                                onChange={(e) => handleInputChange(index, e)}
                              />
                            </div>
                            <button
                              type='button'
                              className='text-red-600 hover:text-red-400 self-center col-span-1'
                              onClick={() => deleteForm(index)}
                            >
                              <UilTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {indexEditFoodOptionItem !== -1 && (
                    <div>
                      <button
                        type='button'
                        className='flex items-center mt-5 text-blue-600 hover:text-blue-400'
                        onClick={addNewFormEdit}
                      >
                        <UilPlus />
                        <span>Thêm</span>
                      </button>
                      <div className='h-52 overflow-scroll'>
                        {editAdditionalForm.map((form, index) => (
                          <div
                            key={index}
                            className='grid grid-cols-1 md:grid-cols-8 gap-5 md:gap-10 border border-dashed border-blue-400 mt-5 py-5'
                          >
                            <div className='items-center justify-center col-span-1 flex'>{index + 1}</div>
                            <div className='col-span-4'>
                              <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3'>
                                Loại tùy chọn
                              </div>
                              <input
                                type='text'
                                name='name'
                                className='px-3 py-3.5 w-full outline-none border border-gray-300 mt-3 focus:border-gray-500 rounded-md focus:shadow-sm'
                                placeholder='Không cay'
                                autoComplete='off'
                                value={form.name}
                                onChange={(e) => handleInputChangeEdit(index, e)}
                              />
                            </div>
                            <div className='col-span-2'>
                              <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3'>
                                Giá tiền
                              </div>
                              <input
                                type='number'
                                name='price'
                                className='px-3 py-3.5 w-full outline-none border border-gray-300 mt-3 focus:border-gray-500 rounded-md focus:shadow-sm'
                                placeholder='0đ'
                                autoComplete='off'
                                value={form.price}
                                onChange={(e) => handleInputChangeEdit(index, e)}
                              />
                            </div>
                            <button
                              type='button'
                              className='text-red-600 hover:text-red-400 self-center col-span-1'
                              onClick={() => deleteFormEdit(index)}
                            >
                              <UilTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <hr />
                  <div className='flex justify-end gap-x-3 mt-5'>
                    <button
                      type='submit'
                      className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                    >
                      <span className='me-2'>Lưu</span>
                      <Save />
                    </button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        }
      ></Modal>
      <Modal
        children={
          <div className=''>
            <div className='flex justify-between p-5 items-center bg-[#EE5951] text-white rounded-t-md'>
              <div className='text-2xl font-semibold'>Bạn có chắc không?</div>
              {/* button close */}
              <button
                type='button'
                onClick={() => setIsOpenModalDeleteFood(false)}
                className='text-white bg-black/10 hover:bg-red-600 text-sm w-8 h-8  inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white rounded-full'
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
                <span className='sr-only'>Close modal</span>
              </button>
            </div>
            <div className='p-10 bg-white flex justify-between'>
              <div className='self-start'>
                <svg xmlns='http://www.w3.org/2000/svg' width='126' height='126' viewBox='0 0 126 126'>
                  <g fill='none' fill-rule='evenodd'>
                    <polygon points='0 126 126 126 126 0 0 0' />
                    <g transform='translate(24 13)'>
                      <path
                        fill='#D9E1E8'
                        d='M70,97 C70.553,97 71,97.447 71,98 C71,98.553 70.553,99 70,99 L13,99 C12.447,99 12,98.553 12,98 C12,97.447 12.447,97 13,97 L70,97 Z M7,97 C7.553,97 8,97.447 8,98 C8,98.553 7.553,99 7,99 L2,99 C1.447,99 1,98.553 1,98 C1,97.447 1.447,97 2,97 L7,97 Z'
                      />
                      <path
                        fill='#FFB5B3'
                        d='M72.3569,20.3986 C72.4349,20.9456 72.0549,21.4516 71.5079,21.5306 C64.8829,22.4766 58.8539,25.7366 55.3809,30.2496 C55.1839,30.5056 54.8869,30.6396 54.5869,30.6396 C54.3739,30.6396 54.1599,30.5726 53.9779,30.4316 C53.5399,30.0956 53.4589,29.4676 53.7959,29.0296 C57.5799,24.1126 64.0959,20.5686 71.2249,19.5496 C71.7729,19.4746 72.2779,19.8506 72.3569,20.3986 Z M82.0565,8.9246 C82.6075,8.9556 83.0295,9.4276 82.9985,9.9786 C82.9697143,10.4911714 82.5649898,10.8813041 82.0621542,10.918409 L81.9072965,10.9192143 C80.9053692,10.8820296 60.76388,10.23962 47.8955,24.8426 C47.6985,25.0676 47.4215,25.1816 47.1455,25.1816 C46.9105,25.1816 46.6745,25.0996 46.4845,24.9316 C46.0705,24.5666 46.0305,23.9346 46.3955,23.5206 C60.1835,7.8726 81.1725,8.8726 82.0565,8.9246 Z'
                      />
                      <path
                        fill='#7992A5'
                        d='M52.6914,99 L25.3084,99 C22.2774,99 19.7224,96.739 19.3524,93.731 L13.0004,42 L65.0004,42 L58.6474,93.731 C58.2774,96.739 55.7224,99 52.6914,99'
                      />
                      <path
                        fill='#D9E1E8'
                        d='M25.993,52.887 L29.993,87.887 C30.057,88.436 29.662,88.931 29.113,88.993 C29.075,88.998 29.037,89 28.999,89 C28.497,89 28.064,88.624 28.007,88.113 L24.007,53.113 C23.943,52.564 24.338,52.069 24.887,52.007 C25.422,51.932 25.932,52.337 25.993,52.887 Z M53.113,52.007 C53.662,52.069 54.057,52.564 53.993,53.113 L49.993,88.113 C49.936,88.624 49.503,89 49.001,89 C48.963,89 48.925,88.998 48.887,88.993 C48.338,88.931 47.943,88.436 48.007,87.887 L52.007,52.887 C52.068,52.337 52.568,51.931 53.113,52.007 Z M39,52.069 C39.553,52.069 40,52.517 40,53.069 L40,88 C40,88.553 39.553,89 39,89 C38.447,89 38,88.553 38,88 L38,53.069 C38,52.517 38.447,52.069 39,52.069 Z'
                      />
                      <path
                        fill='#2B5571'
                        d='M67.5,38 C68.881,38 70,39.119 70,40.5 C70,41.881 68.881,43 67.5,43 L10.5,43 C9.119,43 8,41.881 8,40.5 C8,39.119 9.119,38 10.5,38 L67.5,38 Z M47.8322,0.8762 C50.4454308,-0.5678 53.7175281,0.318916634 55.256358,2.84720072 L55.3742,3.0502 L55.4239961,3.15498607 C55.5803743,3.54531334 55.4507476,3.99495649 55.1102382,4.24280446 L55.0122,4.3052 L2.3602,33.3692 C1.9132,33.6152 1.3512,33.4542 1.1042,33.0082 C-0.3398,30.3949692 0.546916634,27.1228719 3.07427569,25.5877421 L3.2772,25.4702 L10.8432,21.2942 L10.6172,20.8872 C9.5822,19.0142 9.3392,16.8522 9.9302,14.7992 C10.4949619,12.8420571 11.7526943,11.2060027 13.4883017,10.1622817 L13.7522,10.0102 L29.1662,1.5022 C32.949,-0.58618 37.7046852,0.7214144 39.900962,4.40567226 L40.0322,4.6342 L40.2632,5.0512 L40.2632,5.0542 L47.8322,0.8762 Z M36.5322,6.5702 C35.5005871,4.70245806 33.1821896,3.98664121 31.287222,4.9067211 L31.0992,5.0042 L15.6852,13.5122 C14.7492,14.0282 14.0702,14.8792 13.7742,15.9062 C13.5009692,16.8542 13.5830521,17.8482118 14.004718,18.7317166 L14.1172,18.9502 L14.3442,19.3582 L14.3432,19.3612 L36.7632,6.9862 L36.5322,6.5702 Z'
                      />
                    </g>
                  </g>
                </svg>
              </div>
              <div className='flex flex-col gap-5 self-center '>
                <p className='text-lg text-gray-700 '>
                  Các món ăn đã xóa sẽ bị loại bỏ khỏi cửa hàng và không thể khôi phục lại.
                </p>
                <div className='p-5 bg-[#EAF7FF] rounded-md'>
                  <div className='font-bold text-base'>Bạn có muốn ẩn món ăn mà không cần xóa không?</div>
                  <p className='text-base font-normal text-gray-700 mt-3'>
                    Bạn có thể ẩn món ăn khỏi cửa hàng của mình bằng cách tắt hiển thị sản phẩm.
                  </p>
                </div>
              </div>
            </div>
            <div className='flex px-5 py-10 justify-end gap-3 items-center'>
              <button
                className='text-red-500 border border-red-200 hover:text-white hover:bg-red-600 px-10 py-2 rounded-3xl'
                type='button'
                onClick={() => setIsOpenModalDeleteFood(false)}
              >
                Hủy
              </button>
              <button
                className='text-white bg-red-600 hover:bg-red-500 px-10 py-2 rounded-3xl'
                type='button'
                onClick={() => handleDeleteFood(food?._id)}
              >
                Xóa
              </button>
            </div>
          </div>
        }
        showDialog={isOpenModalDeleteFood}
        width='max-w-2xl'
      ></Modal>
      {showToast.is_open && <Toast message={showToast.message} type={showToast.type} />}
    </div>
  )
}
export default FoodDetail
