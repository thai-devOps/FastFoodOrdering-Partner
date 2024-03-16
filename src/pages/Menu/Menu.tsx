import { ChevronDown, MoreHorizontal, Pencil, Plus, Save, Trash2, LayoutPanelTop, Scroll } from 'lucide-react'
import { FC, useContext, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import './dropdown.css'
import { CSSTransition } from 'react-transition-group'
import { UilPlus, UilTrash } from '@iconscout/react-unicons'
import { FormProvider, useController, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  MenuCategoryFormType,
  MenuSectionRequestType,
  MenuRequestType,
  categorySchema,
  menuSectionSchema,
  menuSchema,
  CategoryFormType
} from '~/utils/rules'
import { FoodRequestType, foodSchema } from '~/schemas/food.schema'
import CommonInput from '~/components/CommonInput'
import TextArea from '~/components/AreaInput'
import InputFile from '~/components/InputFile'
import { AppContext } from '~/contexts/app.context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import authApi from '~/apis/authApi'
import { toast } from 'react-toastify'
import Toast from '~/components/Toast'
import Modal from '~/components/Modal'
import { IImage } from '~/types/user.type'
import { SHOP_API } from '~/apis/shops.api'
import { FOOD_API } from '~/apis/food.api'
import { MENUS_API } from '~/apis/menu.api'
import SelectMutipleInput from '~/components/SelectMutipleInput'
import FoodItem from '~/components/FoodItem'
import { SellingStatus, DiscountType } from '~/enums'
import { formatCurrency } from '~/utils/utils'
import classNames from 'classnames'
import { foodOptionSchema } from '~/schemas/food_options.schema'
import { FoodOptions } from '~/types/food_options.type'
import Loading from '~/components/Loading'
import { MenuSection } from '~/types/menu_section.type'
import { NavLink } from 'react-router-dom'
import { partnerPaths } from '~/routes/partnerRoute'
const Menu: FC = () => {
  const [isOpenModalDeleteMenuSection, setIsOpenModalDeleteMenuSection] = useState<boolean>(false)
  const [isOpenModalDeleteMenu, setIsOpenModalDeleteMenu] = useState<boolean>(false)
  const [isOpenMenuCuisine, setIsOpenMenuCuisine] = useState<boolean>(false)
  const [selectedOptions, setSelectedOptions] = useState<any>(null)
  const [isOpenMoreActions, setIsOpenMoreActions] = useState<boolean>(false)
  const [isOpenMenuDetail, setIsOpenMenuDetail] = useState<boolean>(false)
  const [currentAddFoodCategory, setCurrentAddFoodCategory] = useState<string>('Thêm món ăn')
  const [currentMenuCategoryId, setCurrentMenuCategoryId] = useState<string>('')
  const [isOpenModalAddFoodType, setIsOpenModalAddFoodType] = useState<boolean>(false)
  const { shop, setShop } = useContext(AppContext)
  const [isSingleSelect, setIsSingleSelect] = useState<boolean>(true)
  const [options, setOptions] = useState<FoodOptions[]>([])
  const queryClient = useQueryClient()
  const [isEditMenu, setIsEditMenu] = useState<boolean>(false)
  const [isEditMenuSection, setIsEditMenuSection] = useState<boolean>(false)
  const [currentEditFoodItemId, setCurrentEditFoodItemId] = useState<string>('')
  const [openModalAddFoodOptions, setOpenModalAddFoodOptions] = useState<boolean>(false)
  const [file, setFile] = useState<File>()
  const handleChangeFileFoodImage = (file?: File) => {
    setFile(file)
  }
  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ''
  }, [file])

  const [showToast, setShowToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    is_open: boolean
  }>({
    message: 'Thông báo mẫu',
    type: 'success',
    is_open: false
  })
  /**
   * Form add new menu
   */
  const methodsFormAddMenu = useForm({
    resolver: yupResolver(menuSchema)
  })
  /**
   * Form add food item
   */
  const methodsFormAddFoodItem = useForm({
    resolver: yupResolver(foodSchema)
  })
  const {
    handleSubmit: handleSubmitAddNewFoodItem,
    register: registerAddNewFoodItem,
    watch: watchAddNewFoodItem,
    control: controlAddNewFoodItem,
    formState: { errors: errorsAddNewFoodItem }
  } = methodsFormAddFoodItem
  const { field, fieldState } = useController({
    name: 'discount_type',
    control: controlAddNewFoodItem,
    defaultValue: ''
  })

  const uploadImageMutation = useMutation({
    mutationFn: (body: FormData) => authApi.uploadAvatar(body)
  })
  const createFoodMutation = useMutation({
    mutationFn: (body: FoodRequestType) => FOOD_API.create(body)
  })
  // food items data
  const { data: food_items } = useQuery({
    queryKey: ['dataFoodItems', shop?._id as string],
    queryFn: () => FOOD_API.getByShopId(shop?._id as string),
    enabled: !!shop?._id
  })
  const dataFoodItems = food_items?.data?.data || []
  const onSubmitAddNewFoodItem = handleSubmitAddNewFoodItem(async (data) => {
    // handle selectedOption => string[]
    const categories =
      (selectedOptions as { value: string; label: string }[])?.map((option, _) => option.value) || ([] as string[])
    if (categories.length === 0) {
      alert('Vui lòng chọn loại món ăn')
      return
    }
    let discount = {}
    if (data.discount_status && data.discount_type && data.discount_value) {
      discount = {
        status: data.discount_status,
        type: data.discount_type,
        value: data.discount_value
      }
    }
    if (data.discount_status && !data.discount_type && !data.discount_value) {
      discount = {
        status: data.discount_status,
        type: '',
        value: 0
      }
    }
    if (!data.discount_status && !data.discount_type && !data.discount_value) {
      discount = {
        status: false,
        type: '',
        value: 0
      }
    }
    const food: FoodRequestType = {
      name: data.name,
      description: data.description,
      price: data.price,
      cost_of_goods_sold: data.cost_of_goods_sold,
      menu_section_id: currentMenuCategoryId,
      shop_id: shop?._id as string,
      quantity: data.quantity,
      categories,
      image: {
        public_id: '',
        url: ''
      },
      foodOptions: options,
      publish_status: data.publish_status ? data.publish_status : true,
      is_selling: data.is_selling ? SellingStatus.WAITING : SellingStatus.IN_STORE,

      discount: discount as any
    }
    console.log('food', food)
    if (!file) {
      alert('Vui lòng chọn ảnh món ăn')
      return
    } else {
      let img: IImage = {
        public_id: '',
        url: ''
      }
      const formData = new FormData()
      formData.append('avatar', file)
      try {
        const response = await uploadImageMutation.mutateAsync(formData)
        img = {
          public_id: response.data.data.public_id,
          url: response.data.data.url
        }
        createFoodMutation.mutate(
          { ...food, image: img },
          {
            onSuccess: async () => {
              const drawer = document.getElementById('drawer-right-add-dish-item')
              drawer?.classList.toggle('translate-x-full')
              setFile(undefined)
              setShowToast({
                message: 'Tạo món ăn thành công',
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
              methodsFormAddFoodItem.reset()
              setOptions([])
              selectedOptions && setSelectedOptions(null) // reset selectedOptions
              await queryClient.invalidateQueries({
                queryKey: ['dataFoodItems', shop?._id as string]
              })
            },
            onError: (error) => {
              toast.error('Tạo món ăn thất bại')
              console.log(error)
            }
          }
        )
      } catch (error) {
        console.log(error)
      }
    }
  })

  const { data: shopsData } = useQuery({
    queryKey: ['shopsData'],
    queryFn: () => SHOP_API.getByPartnerId()
  })
  const { data: menusData, isLoading: isLoadingMenusData } = useQuery({
    queryKey: ['dataMenus'],
    queryFn: () => MENUS_API.getByPartnerId()
  })
  // find active menu item
  const activeMenu = menusData?.data?.data?.find((menu) => menu.is_active === true) || null
  const deleteMenuMutation = useMutation({
    mutationFn: (id: string) => MENUS_API.delete(id)
  })
  const handleDeleteMenu = () => {
    deleteMenuMutation.mutate(activeMenu?._id as string, {
      onSuccess: async () => {
        setIsOpenMenuDetail(false)
        setIsOpenModalDeleteMenu(false)
        await queryClient.invalidateQueries({
          queryKey: ['dataMenus']
        })
      },
      onError: (error) => {
        console.log(error)
      }
    })
  }
  const handleActiveMenuMutation = useMutation({
    mutationFn: (id: string) => MENUS_API.updateActiveMenu(id)
  })
  const handleActiveMenu = (id: string) => {
    setIsOpenMenuCuisine(false)
    handleActiveMenuMutation.mutate(id, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['dataMenus']
        })
      },
      onError: (error) => {
        console.log(error)
      }
    })
  }

  // get all menu category by menu id
  const { data: menuCategoriesData, isLoading: isLoadingMenuCategories } = useQuery({
    queryKey: ['dataMenuSections', activeMenu?._id as string],
    queryFn: () => authApi.getAllMenuSectionByMenuId(activeMenu?._id as string),
    enabled: !!activeMenu?._id
  })
  const dataMenuSections = menuCategoriesData?.data?.data || []
  useEffect(() => {
    if (shopsData) {
      setShop(shopsData?.data?.data)
    }
    setTimeout(async () => {
      await queryClient.invalidateQueries({
        queryKey: ['dataMenus']
      })
    })
    setTimeout(async () => {
      await queryClient.invalidateQueries({
        queryKey: ['dataFoodItems']
      })
    })
  }, [shopsData, setShop, queryClient])
  const {
    handleSubmit: handleSubmitAddNewMenu,
    register: registerAddNewMenu,
    reset: resetAddNewMenu,
    formState: { errors: errorsAddNewMenu }
  } = methodsFormAddMenu
  //create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: (body: MenuRequestType) => MENUS_API.create(body)
  })
  //update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: (body: MenuRequestType) => MENUS_API.update(body._id as string, body)
  })
  // update menu category mutation
  const updateMenuSectionsMutation = useMutation({
    mutationFn: (body: MenuSectionRequestType) => authApi.updateMenuSection(body)
  })
  const [openDropdownIndex, setOpenDropdownIndex] = useState<any>(null)
  const toggleDropdown = (id: string) => {
    setOpenDropdownIndex(openDropdownIndex === id ? null : id)
  }
  // handle submit add new menu
  const onSubmitAddNewMenu = handleSubmitAddNewMenu((data) => {
    if (data._id) {
      const formData: MenuRequestType = {
        _id: data._id,
        name: data.name,
        description: data.description,
        is_draft: data.is_draft,
        is_active: data.is_active,
        shop_id: shop?._id as string
      }
      updateMenuMutation.mutate(formData, {
        onSuccess: async () => {
          const drawer = document.getElementById('drawer-right-add-new-menu')
          drawer?.classList.toggle('translate-x-full')
          setShowToast({
            message: 'Cập nhật thực đơn thành công',
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
          await queryClient.invalidateQueries({
            queryKey: ['dataMenus']
          })
          resetAddNewMenu()
        },
        onError: (error) => {
          toast.error('Cập nhật thực đơn thất bại')
          console.log(error)
        }
      })
    } else {
      const formData: MenuRequestType = {
        name: data.name,
        description: data.description,
        is_draft: data.is_draft,
        is_active: data.is_active,
        shop_id: shop?._id as string
      }
      createMenuMutation.mutate(formData, {
        onSuccess: async () => {
          const drawer = document.getElementById('drawer-right-add-new-menu')
          drawer?.classList.toggle('translate-x-full')
          setShowToast({
            message: 'Tạo thực đơn thành công',
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
          await queryClient.invalidateQueries({
            queryKey: ['dataMenus']
          })
          resetAddNewMenu()
        },
        onError: (error) => {
          toast.error('Tạo thực đơn thất bại')
          console.log(error)
        }
      })
    }
  })
  const methodsFormAddMenuSection = useForm<MenuCategoryFormType>({
    resolver: yupResolver(menuSectionSchema)
  })
  const {
    handleSubmit: handleSubmitAddNewMenuSection,
    register: registerAddNewMenuSection,
    reset: resetAddNewMenuSection,
    formState: { errors: errorsAddNewMenuSection }
  } = methodsFormAddMenuSection
  //create menu category mutation
  const createMenuCategoryMutation = useMutation({
    mutationFn: (body: MenuSectionRequestType) => authApi.createMenuSection(body)
  })
  // handle submit add new menu section
  const onSubmitAddNewMenuSection = handleSubmitAddNewMenuSection((data) => {
    if (data._id) {
      const formData: MenuSectionRequestType = {
        _id: data._id,
        name: data.name,
        description: data.description,
        menuId: (activeMenu?._id as string) || ''
      }
      updateMenuSectionsMutation.mutate(formData, {
        onSuccess: async () => {
          const drawer = document.getElementById('drawer-right-add-menu-section')
          drawer?.classList.toggle('translate-x-full')
          setShowToast({
            message: 'Cập nhật danh mục thực đơn thành công',
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
          await queryClient.invalidateQueries({
            queryKey: ['dataMenuSections', activeMenu?._id as string]
          })
          resetAddNewMenuSection()
        },
        onError: (error) => {
          toast.error('Cập nhật danh mục thực đơn thất bại')
          console.log(error)
        }
      })
    } else {
      const formData: MenuSectionRequestType = {
        name: data.name,
        description: data.description,
        menuId: (activeMenu?._id as string) || ''
      }
      createMenuCategoryMutation.mutate(formData, {
        onSuccess: async () => {
          const drawer = document.getElementById('drawer-right-add-menu-section')
          drawer?.classList.toggle('translate-x-full')
          setShowToast({
            message: 'Tạo danh mục thực đơn thành công',
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
          await queryClient.invalidateQueries({
            queryKey: ['dataMenuSections', activeMenu?._id as string]
          })
          resetAddNewMenuSection()
        },
        onError: (error) => {
          toast.error('Tạo danh mục thực đơn thất bại')
          console.log(error)
        }
      })
    }
  })
  const onClickHandleAddFoodItem = (menuCategoryId: string, menuCategoryName: string) => {
    setOptions([])
    selectedOptions && setSelectedOptions(null)
    setCurrentEditFoodItemId('')
    setSelectedOptions(undefined)
    setCurrentMenuCategoryId(menuCategoryId)
    setCurrentAddFoodCategory(menuCategoryName)
    methodsFormAddFoodItem.reset()
    methodsFormAddFoodItem.setValue('_id', '')
    methodsFormAddFoodItem.setValue('name', '')
    methodsFormAddFoodItem.setValue('description', '')
    methodsFormAddFoodItem.setValue('price', 0)
    methodsFormAddFoodItem.setValue('quantity', 0)
    methodsFormAddFoodItem.setValue('publish_status', true)
    methodsFormAddFoodItem.setValue('is_selling', true)
    const drawer = document.getElementById('drawer-right-add-dish-item')
    drawer?.classList.toggle('translate-x-full')
  }
  const methodsFormAddCategory = useForm({
    resolver: yupResolver(categorySchema)
  })
  const methodsFormFoodOptions = useForm({
    resolver: yupResolver(foodOptionSchema)
  })
  const {
    handleSubmit: handleSubmitFormFoodOptions,
    register: registerFormFoodOptions,
    reset: resetFormFoodOptions,
    formState: { errors: errorsFormFoodOptions }
  } = methodsFormFoodOptions
  const createCategoryMutation = useMutation({
    mutationFn: (body: CategoryFormType) => authApi.createCategory(body)
  })
  const {
    handleSubmit: handleSubmitAddNewCategory,
    register: registerAddNewCategory,
    reset: resetAddNewCategory,
    formState: { errors: errorsAddNewCategory }
  } = methodsFormAddCategory
  const onSubmitAddNewCategory = handleSubmitAddNewCategory((data) => {
    createCategoryMutation.mutate(data, {
      onSuccess: async () => {
        setIsOpenModalAddFoodType(false)
        resetAddNewCategory()
        setIsOpenModalAddFoodType(false)
        await queryClient.invalidateQueries({
          queryKey: ['dataCategories']
        })
      },
      onError: () => {
        toast.error('Tạo loại món ăn thất bại')
      }
    })
  })
  const handlePrice = () => {
    const price = watchAddNewFoodItem('price')
    const isDiscount = watchAddNewFoodItem('discount_status') as boolean
    const discountType = watchAddNewFoodItem('discount_type') as DiscountType
    const discountValue = watchAddNewFoodItem('discount_value') || 0
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
  const [indexEditFoodOptionItem, setIndexEditFoodOptionItem] = useState<number>(-1)
  const [editAdditionalForms, setEditAdditionalForms] = useState<
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
  const [additionalForms, setAdditionalForms] = useState<
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
  const addNewForm = () => {
    setAdditionalForms([...additionalForms, { name: '', price: 0 }])
  }
  const addNewEditForm = () => {
    setEditAdditionalForms([...editAdditionalForms, { name: '', price: 0 }])
  }
  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const list = [...additionalForms]
    list[index][name as 'name' | 'price'] = value as never
    setAdditionalForms(list)
  }
  const handleEditInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const list = [...editAdditionalForms]
    list[index][name as 'name' | 'price'] = value as never
    setEditAdditionalForms(list)
  }
  const deleteForm = (index: number) => {
    const list = [...additionalForms]
    list.splice(index, 1)
    setAdditionalForms(list)
  }
  const deleteEditForm = (index: number) => {
    const list = [...editAdditionalForms]
    list.splice(index, 1)
    setEditAdditionalForms(list)
  }
  const handleDeleteOption = (index: number) => {
    const list = [...options]
    list.splice(index, 1)
    setOptions(list)
  }
  const handleEditOption = (index: number) => {
    // open modal
    setIndexEditFoodOptionItem(index)
    // setEditAdditionalForms(options[index].options)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setEditAdditionalForms(JSON.parse(JSON.stringify(options[index].options)))
    setOpenModalAddFoodOptions(true)
    methodsFormFoodOptions.setValue('name', options[index].name)
    setIsSingleSelect(options[index].isSingleSelect)
    setAdditionalForms(options[index].options)
  }
  const handleClickAddFoodOptions = () => {
    setIndexEditFoodOptionItem(-1)
    setOpenModalAddFoodOptions(true)
    methodsFormFoodOptions.reset()
    setAdditionalForms([{ name: '', price: 0 }])
    setIsSingleSelect(true)
  }
  const handleAddFoodOptions = handleSubmitFormFoodOptions((data) => {
    // handle edit
    if (indexEditFoodOptionItem !== -1) {
      const formData: FoodOptions & {
        options: { name: string; price: number }[]
      } = {
        name: data.name,
        isSingleSelect: isSingleSelect,
        options: editAdditionalForms
      }
      const list = [...options]
      list[indexEditFoodOptionItem] = formData
      setOptions(list)
      setOpenModalAddFoodOptions(false)
      resetFormFoodOptions()
      setEditAdditionalForms([{ name: '', price: 0 }])
      setIndexEditFoodOptionItem(-1)
      return
    } else {
      // handle add
      const formData: FoodOptions & {
        options: { name: string; price: number }[]
      } = {
        name: data.name,
        isSingleSelect: isSingleSelect,
        options: additionalForms
      }
      setOptions((prev) => [...prev, formData])
      setOpenModalAddFoodOptions(false)
      resetFormFoodOptions()
      setAdditionalForms([{ name: '', price: 0 }])
    }
  })
  const deleteMenuSectionMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteMenuSectionById(id)
  })
  const [menuSectionSelected, setMenuSectionSelected] = useState<MenuSection | null>(null)
  const onClickDeleteMenuSection = (menuSection: MenuSection) => {
    setMenuSectionSelected(menuSection)
    setIsOpenModalDeleteMenuSection(true)
  }
  const handleDeleteMenuSection = (id: string) => {
    deleteMenuSectionMutation.mutate(id, {
      onSuccess: async () => {
        setMenuSectionSelected(null)
        setIsOpenModalDeleteMenuSection(false)
        await queryClient.invalidateQueries({
          queryKey: ['dataMenuSections']
        })
      },
      onError: (error) => {
        toast.error('Xóa danh mục thực đơn thất bại')
        console.log(error)
      }
    })
  }
  if (isLoadingMenusData || handleActiveMenuMutation.isPending) {
    return <Loading></Loading>
  }
  return (
    <div className=''>
      <Helmet>
        <title>Thực đơn | TTFood-Partner</title>
        <meta name='description' content='Thực đơn TTFood' />
      </Helmet>
      {showToast.is_open && <Toast message={showToast.message} type={showToast.type} />}
      <div className='container mx-auto pl-10 pr-5 py-5'>
        <div className='flex flex-col pt-4 pb-7 justify-between rounded-md'>
          <div className='flex justify-between mb-4'>
            <h1 className='inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white'>
              Thực đơn
            </h1>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                {/* Button to toggle dropdown */}
                <button
                  type='button'
                  onClick={() => setIsOpenMoreActions(!isOpenMoreActions)}
                  aria-haspopup='true'
                  aria-expanded={isOpenMenuCuisine ? 'true' : 'false'}
                  className='text-[#3899ec] text-base inline-flex items-center bg-white hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 hover:text-white hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-xl shadow-md px-5 py-2 text-center'
                >
                  <span className='me-2'>Tác vụ khác</span>
                  <ChevronDown size={18} />
                </button>

                {/* Dropdown menu */}
                <CSSTransition
                  in={isOpenMoreActions}
                  timeout={0}
                  classNames='dropdown'
                  unmountOnExit
                  onExited={() => setIsOpenMoreActions(false)}
                >
                  <div className='absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-xl w-56 shadow-lg py-2'>
                    {/* create arrow top */}
                    <div className='absolute left-1/2 transform -translate-x-1/2 w-0 h-0 top-[-20px] right-4 border-solid border-[12px] border-white border-t-transparent border-r-transparent border-l-transparent'></div>
                    {/* Dropdown items */}
                    <ul className='py-2 text-sm text-gray-700 dark:text-gray-200'>
                      <li>
                        <NavLink
                          to={partnerPaths.manage_menu}
                          className='inline-flex w-full text-sm gap-2 items-center px-4 py-2 hover:bg-[#EAF7FF] hover:text-[#3899ec]'
                        >
                          <Scroll className='w-5 h-5' />
                          <span>Quản lý thực đơn</span>
                        </NavLink>
                      </li>
                      <li>
                        <div className='w-48 my-2 h-[1px] bg-gray-200 mx-auto'></div>
                      </li>
                      {/* <li>
                        <button className='inline-flex w-full text-sm gap-2 items-center px-4 py-2 hover:bg-[#EAF7FF] hover:text-[#3899ec]'>
                          <LayoutList className='w-5 h-5' />
                          <span>Quản lý danh mục</span>
                        </button>
                      </li> */}
                      <li>
                        <div className='w-48 my-2 h-[1px] bg-gray-200 mx-auto'></div>
                      </li>
                      <li>
                        <NavLink
                          to={partnerPaths.manage_foods}
                          className='inline-flex w-full text-sm gap-2 items-center px-4 py-2 hover:bg-[#EAF7FF] hover:text-[#3899ec]'
                        >
                          <LayoutPanelTop className='w-5 h-5' />
                          <span>Quản lý món ăn</span>
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </CSSTransition>
              </div>
              <button
                type='button'
                onClick={() => {
                  setIsEditMenu(false)
                  methodsFormAddMenu.reset()
                  methodsFormAddMenu.setValue('_id', '')
                  methodsFormAddMenu.setValue('is_draft', false)
                  methodsFormAddMenu.setValue('is_active', true)
                  methodsFormAddMenu.setValue('description', '')
                  methodsFormAddMenu.setValue('name', '')
                  const drawer = document.getElementById('drawer-right-add-new-menu')
                  drawer?.classList.toggle('translate-x-full')
                }}
                className='text-[#3899ec] text-base inline-flex items-center bg-white hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 hover:text-white hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-xl shadow-md px-5 py-2 text-center'
              >
                <Plus />
                <span>Thêm Thực Đơn</span>
              </button>
            </div>
          </div>
          {Number(menusData?.data?.data.length) > 0 ? (
            <>
              <div className='flex items-center mb-5'>
                <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3'>
                  Hiển thị thực đơn:
                </div>
                {isLoadingMenusData ? (
                  <div role='status' className='max-w-sm animate-pulse'>
                    <div className='h-10 bg-gray-200 rounded-full dark:bg-gray-700 w-32' />
                    <span className='sr-only'>Loading...</span>
                  </div>
                ) : (
                  <div className='relative'>
                    {/* Button to toggle dropdown */}
                    <button
                      type='button'
                      onClick={() => setIsOpenMenuCuisine(!isOpenMenuCuisine)}
                      aria-haspopup='true'
                      aria-expanded={isOpenMenuCuisine ? 'true' : 'false'}
                      className='py-2.5 px-6 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-[#EAF7FF] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center gap-1 transition duration-150 ease-in-out'
                    >
                      <span>{activeMenu?.name}</span>
                      <ChevronDown size={16}></ChevronDown>
                    </button>

                    {/* Dropdown menu */}
                    <CSSTransition
                      in={isOpenMenuCuisine}
                      timeout={150}
                      classNames='dropdown'
                      unmountOnExit
                      onExited={() => setIsOpenMenuCuisine(false)}
                    >
                      <div className='absolute right-0 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-xl w-48 shadow-lg'>
                        {/* Dropdown items */}
                        <div className='px-5 bg-blue-600 rounded-tr-xl rounded-tl-xl py-2 text-sm text-gray-900 dark:text-white'>
                          <div className='font-medium truncate text-white'>{activeMenu?.name}</div>
                        </div>
                        <ul className='py-2 text-sm text-gray-700 dark:text-gray-200 h-[120px] overflow-y-scroll'>
                          {menusData?.data?.data?.map(
                            (menu, _) =>
                              !menu.is_active && (
                                <li key={menu._id}>
                                  <button
                                    type='button'
                                    onClick={() => handleActiveMenu(menu._id)}
                                    className='flex w-full px-4 py-2 hover:bg-[#EAF7FF] hover:text-[#3899ec]'
                                  >
                                    {menu.name}
                                  </button>
                                </li>
                              )
                          )}
                        </ul>
                        <div className='py-2'>
                          <button
                            type='button'
                            onClick={() => {
                              setIsOpenMenuCuisine(!isOpenMenuCuisine)
                              setIsEditMenu(false)
                              methodsFormAddMenu.reset()
                              methodsFormAddMenu.setValue('_id', '')
                              methodsFormAddMenu.setValue('is_draft', false)
                              methodsFormAddMenu.setValue('is_active', true)
                              methodsFormAddMenu.setValue('description', '')
                              methodsFormAddMenu.setValue('name', '')
                              const drawer = document.getElementById('drawer-right-add-new-menu')
                              drawer?.classList.toggle('translate-x-full')
                            }}
                            className='inline-flex w-full py-2 px-2.5 text-gray-800 text-sm items-center hover:bg-[#EAF7FF] hover:text-[#3899ec]'
                          >
                            <Plus />
                            <span>Thêm Mới Thực Đơn</span>
                          </button>
                        </div>
                      </div>
                    </CSSTransition>
                  </div>
                )}
              </div>
              <div className='flex justify-between items-center mb-5'>
                <div className='flex items-center gap-4'>
                  {isLoadingMenusData ? (
                    <div role='status' className='max-w-sm animate-pulse flex items-center'>
                      <div>
                        <div className='h-1 bg-gray-200 rounded-md dark:bg-gray-700 w-20 mb-2.5' />
                        <div className='h-1 bg-gray-200 rounded-md dark:bg-gray-700 w-20 ' />
                      </div>
                      <div className='h-5 ms-3 bg-gray-200 dark:bg-gray-700 w-5 rounded-full ' />
                      <span className='sr-only'>Loading...</span>
                    </div>
                  ) : (
                    <>
                      <h3 className='inline-block text-xl font-medium tracking-tight text-gray-900 dark:text-white'>
                        {activeMenu?.name}
                      </h3>
                      <button
                        onClick={() => {
                          setIsEditMenu(true)
                          methodsFormAddMenu.reset({
                            _id: activeMenu?._id,
                            name: activeMenu?.name,
                            description: activeMenu?.description,
                            is_draft: activeMenu?.is_draft
                          })
                          const drawer = document.getElementById('drawer-right-add-new-menu')
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
                    </>
                  )}
                </div>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => setIsOpenMenuDetail(!isOpenMenuDetail)}
                      aria-haspopup='true'
                      aria-expanded={isOpenMenuDetail ? 'true' : 'false'}
                      className='rounded-full hover:bg-blue-600 hover:text-white text-blue-700 bg-white py-2 px-2 cursor-pointer transition duration-75 ease-linear me-2'
                    >
                      <MoreHorizontal />
                    </button>
                    {/* Dropdown menu */}
                    <CSSTransition
                      in={isOpenMenuDetail}
                      timeout={10}
                      classNames='dropdown'
                      unmountOnExit
                      onExited={() => setIsOpenMenuDetail(false)}
                    >
                      <div className='absolute z-10 left-1/2 transform -translate-x-1/2 right-0 mt-2 origin-top-right bg-white border border-gray-200 divide-y w-60 divide-gray-100 rounded-xl shadow-lg'>
                        <div className='absolute left-1/2 transform -translate-x-1/2 w-0 h-0 top-[-20px] right-4 border-solid border-[12px] border-white border-t-transparent border-r-transparent border-l-transparent'></div>
                        {/* Dropdown items */}
                        <ul className='py-2 text-sm text-gray-700 dark:text-gray-200'>
                          <li>
                            <button
                              type='button'
                              onClick={() => {
                                setIsOpenMenuDetail(!isOpenMenuDetail)
                                setIsEditMenu(true)
                                methodsFormAddMenu.reset({
                                  _id: activeMenu?._id,
                                  name: activeMenu?.name,
                                  is_active: activeMenu?.is_active,
                                  description: activeMenu?.description,
                                  is_draft: activeMenu?.is_draft
                                })
                                const drawer = document.getElementById('drawer-right-add-new-menu')
                                drawer?.classList.toggle('translate-x-full')
                              }}
                              className='inline-flex w-full text-sm gap-2 items-center px-4 py-2 hover:bg-[#EAF7FF] hover:text-[#3899ec]'
                            >
                              <Pencil className='w-5 h-5' />
                              <span>Chỉnh sửa chi tiết thực đơn</span>
                            </button>
                          </li>
                          {/* <li>
                        <button className='inline-flex w-full text-sm gap-2 items-center px-4 py-2 hover:bg-[#EAF7FF] hover:text-[#3899ec]'>
                          <ChevronDownCircle className='w-5 h-5' />
                          <span>Cuộn tất cả danh mục</span>
                        </button>
                      </li> */}
                        </ul>
                        <div className='p-2'>
                          <button
                            type='button'
                            onClick={() => setIsOpenModalDeleteMenu(true)}
                            className='inline-flex items-center w-full py-2 px-2.5 text-sm gap-3 text-red-600 tracking-wide hover:bg-red-100'
                          >
                            <Trash2 className='w-5 h-5' />
                            <span>Xóa thực đơn</span>
                          </button>
                        </div>
                      </div>
                    </CSSTransition>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      const drawer = document.getElementById('drawer-right-add-menu-section')
                      drawer?.classList.toggle('translate-x-full')
                      setIsEditMenuSection(false)
                      methodsFormAddMenuSection.setValue('_id', '')
                      methodsFormAddMenuSection.setValue('description', '')
                      methodsFormAddMenuSection.setValue('name', '')
                    }}
                    className='text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center'
                  >
                    <UilPlus size={20}></UilPlus>
                    <span className='text-base'>Thêm phần danh mục</span>
                  </button>
                </div>
              </div>
              <div className='h-[2px] w-full bg-gray-200 mb-5'></div>
              {isLoadingMenuCategories || isLoadingMenusData ? (
                <div className='bg-white shadow-md'>
                  <div
                    role='status'
                    className='max-w-full p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5' />
                        <div className='w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700' />
                      </div>
                      <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12' />
                    </div>
                    <div className='flex items-center justify-between pt-4'>
                      <div>
                        <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5' />
                        <div className='w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700' />
                      </div>
                      <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12' />
                    </div>
                    <div className='flex items-center justify-between pt-4'>
                      <div>
                        <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5' />
                        <div className='w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700' />
                      </div>
                      <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12' />
                    </div>
                    <div className='flex items-center justify-between pt-4'>
                      <div>
                        <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5' />
                        <div className='w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700' />
                      </div>
                      <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12' />
                    </div>
                    <div className='flex items-center justify-between pt-4'>
                      <div>
                        <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5' />
                        <div className='w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700' />
                      </div>
                      <div className='h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12' />
                    </div>
                    <span className='sr-only'>Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {dataMenuSections.length > 0 ? (
                    <div className='flex flex-col gap-y-10'>
                      {dataMenuSections.map((menuCategory, _) => (
                        <div key={menuCategory._id}>
                          <div>
                            <div className='flex justify-between items-center bg-white py-5 px-3 shadow-md'>
                              <div className='flex items-center gap-3'>
                                <span className='inline-block text-lg font-medium tracking-tight text-gray-900 dark:text-white'>
                                  {menuCategory.name}
                                </span>
                              </div>
                              <div className='flex items-center gap-3'>
                                <button
                                  type='button'
                                  onClick={() => {
                                    onClickHandleAddFoodItem(menuCategory._id, menuCategory.name)
                                  }}
                                  className='relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-blue-400 to-blue-600 group-hover:from-blue-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 dark:focus:ring-blue-800'
                                >
                                  <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
                                    <div className='flex items-center gap-2'>
                                      <Plus size={20}></Plus>
                                      <span>Thêm món ăn</span>
                                    </div>
                                  </span>
                                </button>
                                <div className='flex items-center'>
                                  <button
                                    className='inline-flex rounded-lg items-center w-full py-2 px-2.5 text-sm gap-3 justify-start text-blue-600 tracking-wide hover:bg-blue-100'
                                    onClick={() => {
                                      setIsEditMenuSection(true)
                                      methodsFormAddMenuSection.reset({
                                        _id: menuCategory._id,
                                        name: menuCategory.name,
                                        description: menuCategory.description
                                      })
                                      const drawer = document.getElementById('drawer-right-add-menu-section')
                                      drawer?.classList.toggle('translate-x-full')
                                    }}
                                  >
                                    <svg
                                      viewBox='0 0 24 24'
                                      fill='currentColor'
                                      width={25}
                                      height={25}
                                      className='text-[#3899ec] cursor-pointer'
                                    >
                                      <path d='M16.679,5.60187506 L18.381,7.30587506 C19.207,8.13287506 19.207,9.47787506 18.381,10.3058751 L10.211,18.4858751 L4,19.9998751 L5.512,13.7818751 L13.682,5.60187506 C14.481,4.79987506 15.878,4.79887506 16.679,5.60187506 Z M8.66091072,16.0462125 L9.973,17.3598751 L15.625,11.7018751 L12.289,8.36087506 L6.637,14.0198751 L7.95422762,15.3386821 L11.1467061,12.1463747 C11.3419735,11.9511178 11.6585559,11.9511262 11.8538129,12.1463936 C12.0490698,12.341661 12.0490613,12.6582435 11.8537939,12.8535004 L8.66091072,16.0462125 Z M16.306,11.0198751 L17.7,9.62387506 C18.15,9.17287506 18.15,8.43787506 17.7,7.98687506 L15.998,6.28287506 C15.561,5.84587506 14.801,5.84687506 14.364,6.28287506 L12.97,7.67887506 L16.306,11.0198751 Z M5.426,18.5738751 L8.995,17.7438751 L6.254,14.9988751 L5.426,18.5738751 Z' />
                                    </svg>
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => onClickDeleteMenuSection(menuCategory)}
                                    className='inline-flex rounded-lg items-center w-full py-2 px-2.5 text-sm gap-3 justify-start text-red-600 tracking-wide hover:bg-red-100'
                                  >
                                    <Trash2 />
                                  </button>
                                </div>
                                {/* <button
                              type='button'
                              className='rounded-full border hover:bg-blue-600 hover:text-white text-blue-700 bg-white py-2 px-2 cursor-pointer transition duration-75 ease-linear'
                            >
                              <ChevronUp />
                            </button> */}
                              </div>
                            </div>
                          </div>
                          <hr />
                          {/* dished item */}
                          <>
                            {dataFoodItems.filter((foodItem) => foodItem.menu_section_id === menuCategory._id).length >
                            0 ? (
                              <>
                                {dataFoodItems
                                  .filter((foodItem) => foodItem.menu_section_id === menuCategory._id)
                                  .map((foodItem, index) => (
                                    <FoodItem
                                      key={foodItem._id}
                                      foodItem={foodItem}
                                      index={index}
                                      menuCategory={menuCategory}
                                      methodsFormAddFoodItem={methodsFormAddFoodItem}
                                      openDropdownIndex={openDropdownIndex}
                                      setCurrentAddFoodCategory={setCurrentAddFoodCategory}
                                      setOpenDropdownIndex={setOpenDropdownIndex}
                                      toggleDropdown={toggleDropdown}
                                      setCurrentEditFoodItemId={setCurrentEditFoodItemId}
                                    />
                                  ))}
                              </>
                            ) : (
                              <div className='col-span-9 py-5 text-center bg-white'>
                                <div>Chưa có món nào được thêm vào phần này.</div>
                                <button
                                  className='mt-3 inline-flex items-center text-blue-500 hover:text-blue-400'
                                  onClick={() => onClickHandleAddFoodItem(menuCategory._id, menuCategory.name)}
                                >
                                  <Plus size={18} />
                                  <span>Thêm món ăn</span>
                                </button>
                              </div>
                            )}
                          </>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='grid place-items-center gap-y-2 bg-white py-5 shadow-md'>
                      <svg
                        fill='none'
                        height={120}
                        viewBox='0 0 120 120'
                        width={120}
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path d='M74 8H7V95H74V8Z' fill='#C2E2FF' />
                        <path d='M69.78 89.49L44 90H11V14H70L69.78 89.49Z' fill='white' />
                        <path d='M74 8L44 25H74C74 25 73.96 8.04 74 8Z' fill='#116DFF' />
                        <path
                          d='M83.5 35H82.5C82.5 32.52 80.26 30.5 77.5 30.5C74.74 30.5 72.5 32.52 72.5 35H71.5C71.5 31.97 74.19 29.5 77.5 29.5C80.81 29.5 83.5 31.97 83.5 35Z'
                          fill='white'
                        />
                        <path
                          d='M50.75 34H27V33H50.75V34ZM50.75 40H35V41H50.75V40ZM50.75 49H27V50H50.75V49ZM50.75 56H35V57H50.75V56ZM50.75 63H27V64H50.75V63ZM50.75 70H35V71H50.75V70Z'
                          fill='#192C55'
                        />
                        <path d='M111 112H44V89.71V25H111V112Z' fill='#C2E2FF' />
                        <path
                          d='M84.41 34C83.89 31.16 81.21 29 78 29C74.79 29 72.11 31.16 71.6 34H51V106H104V34H84.41ZM103 105H52V35H72.5C72.5 32.24 74.97 30 78 30C80.66 30 82.88 31.72 83.39 34C83.46 34.32 83.5 34.66 83.5 35H103V105Z'
                          fill='white'
                        />
                        <path
                          clipRule='evenodd'
                          d='M89.68 53.73V89.4C89.68 90.7 88.63 91.75 87.33 91.75C86.03 91.75 84.98 90.7 84.98 89.4V74.04H83.41C82.55 74.04 81.84 73.23 81.84 72.23V66.92C81.84 62.36 83.91 54.52 87.3 52.17C88.34 51.45 89.67 52.31 89.67 53.72L89.68 53.73ZM77.15 53.84C76.29 53.84 75.58 54.65 75.58 55.65V64.69H73.23V55.65C73.23 54.65 72.53 53.84 71.66 53.84C70.79 53.84 70.09 54.65 70.09 55.65V64.69H67.74V55.65C67.74 54.65 67.04 53.84 66.17 53.84C65.3 53.84 64.6 54.65 64.6 55.65V64.69V66.68C64.6 69.75 66.56 72.35 69.3 73.32V89.41C69.3 90.71 70.35 91.76 71.65 91.76C72.95 91.76 74 90.71 74 89.41V73.32C76.73 72.35 78.7 69.75 78.7 66.68V64.69V55.65C78.7 54.65 78 53.84 77.13 53.84H77.15Z'
                          fill='#28BF9A'
                          fillRule='evenodd'
                        />
                      </svg>
                      <div className='text-gray-900 font-bold text-base'>Thêm phần menu đầu tiên của bạn</div>
                      <div className='text-sm font-light-grey'>
                        Để thêm các mục vào menu của bạn, trước tiên hãy tạo một phần.
                      </div>
                      <button
                        type='button'
                        onClick={() => {
                          resetAddNewMenuSection()
                          setIsEditMenuSection(false)
                          const drawer = document.getElementById('drawer-right-add-menu-section')
                          drawer?.classList.toggle('translate-x-full')
                          methodsFormAddMenuSection.setValue('_id', '')
                          methodsFormAddMenuSection.setValue('description', '')
                          methodsFormAddMenuSection.setValue('name', '')
                        }}
                        className='flex gap-2 py-2 items-center text-base font-normal text-blue-700 hover:text-blue-400 transition ease-in-out'
                      >
                        <UilPlus size={20}></UilPlus>
                        <span>Thêm Danh Mục</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className='border py-5 mt-10 rounded-lg'>
              <div className='grid place-items-center gap-y-3 py-14'>
                <svg fill='none' height={120} viewBox='0 0 120 120' width={120} xmlns='http://www.w3.org/2000/svg'>
                  <path d='M74 8H7V95H74V8Z' fill='#C2E2FF' />
                  <path d='M69.78 89.49L44 90H11V14H70L69.78 89.49Z' fill='white' />
                  <path d='M74 8L44 25H74C74 25 73.96 8.04 74 8Z' fill='#116DFF' />
                  <path
                    d='M83.5 35H82.5C82.5 32.52 80.26 30.5 77.5 30.5C74.74 30.5 72.5 32.52 72.5 35H71.5C71.5 31.97 74.19 29.5 77.5 29.5C80.81 29.5 83.5 31.97 83.5 35Z'
                    fill='white'
                  />
                  <path
                    d='M50.75 34H27V33H50.75V34ZM50.75 40H35V41H50.75V40ZM50.75 49H27V50H50.75V49ZM50.75 56H35V57H50.75V56ZM50.75 63H27V64H50.75V63ZM50.75 70H35V71H50.75V70Z'
                    fill='#192C55'
                  />
                  <path d='M111 112H44V89.71V25H111V112Z' fill='#C2E2FF' />
                  <path
                    d='M84.41 34C83.89 31.16 81.21 29 78 29C74.79 29 72.11 31.16 71.6 34H51V106H104V34H84.41ZM103 105H52V35H72.5C72.5 32.24 74.97 30 78 30C80.66 30 82.88 31.72 83.39 34C83.46 34.32 83.5 34.66 83.5 35H103V105Z'
                    fill='white'
                  />
                  <path
                    clipRule='evenodd'
                    d='M89.68 53.73V89.4C89.68 90.7 88.63 91.75 87.33 91.75C86.03 91.75 84.98 90.7 84.98 89.4V74.04H83.41C82.55 74.04 81.84 73.23 81.84 72.23V66.92C81.84 62.36 83.91 54.52 87.3 52.17C88.34 51.45 89.67 52.31 89.67 53.72L89.68 53.73ZM77.15 53.84C76.29 53.84 75.58 54.65 75.58 55.65V64.69H73.23V55.65C73.23 54.65 72.53 53.84 71.66 53.84C70.79 53.84 70.09 54.65 70.09 55.65V64.69H67.74V55.65C67.74 54.65 67.04 53.84 66.17 53.84C65.3 53.84 64.6 54.65 64.6 55.65V64.69V66.68C64.6 69.75 66.56 72.35 69.3 73.32V89.41C69.3 90.71 70.35 91.76 71.65 91.76C72.95 91.76 74 90.71 74 89.41V73.32C76.73 72.35 78.7 69.75 78.7 66.68V64.69V55.65C78.7 54.65 78 53.84 77.13 53.84H77.15Z'
                    fill='#28BF9A'
                    fillRule='evenodd'
                  />
                </svg>
                <div className='text-gray-900 font-bold text-base'>Xây dựng thực đơn cho nhà hàng của bạn</div>
                <div className='text-sm font-light-grey'>
                  Tạo thực đơn chuyên nghiệp bao gồm các phần và mục để giới thiệu đồ ăn trực tuyến.
                </div>
                <button
                  type='button'
                  onClick={() => {
                    setIsEditMenu(false)
                    methodsFormAddMenu.reset()
                    methodsFormAddMenu.setValue('_id', '')
                    methodsFormAddMenu.setValue('is_draft', false)
                    methodsFormAddMenu.setValue('is_active', true)
                    methodsFormAddMenu.setValue('description', '')
                    methodsFormAddMenu.setValue('name', '')
                    const drawer = document.getElementById('drawer-right-add-new-menu')
                    drawer?.classList.toggle('translate-x-full')
                  }}
                  className='flex items-center mt-3 justify-center text-blue-600 hover:text-blue-400'
                >
                  <Plus className='w-5 h-5 me-3' />
                  <span>Thêm thực đơn mới</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        {/* Drawer add new menu component */}
        <div
          id='drawer-right-add-new-menu'
          className='fixed top-[63px] right-0 z-[100] h-screen overflow-y-auto transition-transform translate-x-full bg-white w-96 dark:bg-gray-800'
          tabIndex={-1}
          aria-labelledby='drawer-right-label'
        >
          <div className='p-4'>
            <h5
              id='drawer-right-label'
              className='inline-flex items-center text-xl font-semibold text-gray-900 dark:text-gray-400'
            >
              {isEditMenu ? 'Chỉnh sửa thực đơn' : 'Thêm mới thực đơn'}
            </h5>
            <button
              type='button'
              onClick={() => {
                const drawer = document.getElementById('drawer-right-add-new-menu')
                drawer?.classList.toggle('translate-x-full')
              }}
              aria-controls='drawer-right-add-new-menu'
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
            <FormProvider {...methodsFormAddMenu}>
              <form noValidate onSubmit={onSubmitAddNewMenu}>
                <div className='flex flex-col px-5 h-[380px] overflow-scroll'>
                  <CommonInput
                    name='name'
                    register={registerAddNewMenu}
                    type='text'
                    label='Tên thực đơn'
                    classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                    requiredInput={true}
                    placeholder='Breakfast, Lunch, Dinner Menu etc.'
                    className='mt-1'
                    errorMessage={errorsAddNewMenu.name?.message}
                  />
                  <TextArea
                    name='description'
                    register={registerAddNewMenu}
                    type='text'
                    label='Mô tả thực đơn'
                    classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                    requiredInput={true}
                    placeholder='Thêm thông tin về thực đơn của bạn'
                    className='mt-1'
                    errorMessage={errorsAddNewMenu.description?.message}
                  />
                  <div className='flex items-center gap-x-3'>
                    <CommonInput
                      id='is_draft'
                      name='is_draft'
                      register={registerAddNewMenu}
                      type='checkbox'
                      className='mt-1'
                      classNameInput='cursor-pointer'
                      errorMessage={errorsAddNewMenu.is_draft?.message}
                    />
                    <label htmlFor='is_draft' className='mb-5 cursor-pointer'>
                      Đánh dấu là bản nháp
                    </label>
                  </div>
                  <div className='flex items-center gap-x-3'>
                    <CommonInput
                      id='is_active'
                      name='is_active'
                      register={registerAddNewMenu}
                      type='checkbox'
                      className='mt-1'
                      classNameInput='cursor-pointer'
                      errorMessage={errorsAddNewMenu.is_active?.message}
                    />
                    <label htmlFor='is_active' className='mb-5 cursor-pointer'>
                      Sử dụng thực đơn này
                    </label>
                  </div>
                </div>
                <div className='h-[1px] w-full bg-gray-300 mb-5'></div>
                <div>
                  <div className='flex justify-end gap-x-3 px-5'>
                    <button
                      type='button'
                      onClick={() => {
                        const drawer = document.getElementById('drawer-right-add-new-menu')
                        drawer?.classList.toggle('translate-x-full')
                      }}
                      className='px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
                    >
                      Hủy
                    </button>
                    {createMenuMutation.isPending || updateMenuMutation.isPending ? (
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
        {/* Drawer add new menu section component */}
        <div
          id='drawer-right-add-menu-section'
          className='fixed top-[63px] right-0 z-[100] h-screen overflow-y-auto transition-transform translate-x-full bg-white w-96 dark:bg-gray-800'
          tabIndex={-1}
          aria-labelledby='drawer-right-label'
        >
          <div className='p-4'>
            <h5
              id='drawer-right-label'
              className='inline-flex items-center text-xl font-semibold text-gray-900 dark:text-gray-400'
            >
              {isEditMenuSection ? 'Chỉnh sửa danh mục thực đơn' : 'Thêm mới danh mục thực đơn'}
            </h5>
            <button
              type='button'
              onClick={() => {
                const drawer = document.getElementById('drawer-right-add-menu-section')
                drawer?.classList.toggle('translate-x-full')
              }}
              aria-controls='drawer-right-add-menu-section'
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
            <FormProvider {...methodsFormAddMenuSection}>
              <form noValidate onSubmit={onSubmitAddNewMenuSection}>
                <div className='flex flex-col px-5'>
                  <CommonInput
                    name='name'
                    register={registerAddNewMenuSection}
                    type='text'
                    label='Tên danh mục thực đơn'
                    classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                    requiredInput={true}
                    placeholder='Món khai vị, chính, tráng miệng vv.'
                    className='mt-3'
                    errorMessage={errorsAddNewMenuSection.name?.message}
                  />
                  <TextArea
                    name='description'
                    register={registerAddNewMenuSection}
                    type='text'
                    label='Mô tả danh mục thực đơn'
                    classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                    requiredInput={true}
                    placeholder='Thêm thông tin về danh mục thực đơn'
                    className='mt-3'
                    errorMessage={errorsAddNewMenuSection.description?.message}
                  />
                </div>
                <div className='h-[1px] w-full bg-gray-300 mb-5'></div>
                <div>
                  <div className='flex justify-end gap-x-3 px-5'>
                    {isEditMenuSection && !updateMenuSectionsMutation.isPending && (
                      <button
                        type='button'
                        onClick={() => {
                          const drawer = document.getElementById('drawer-right-add-menu-section')
                          drawer?.classList.toggle('translate-x-full')
                        }}
                        className='px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
                      >
                        Hủy
                      </button>
                    )}
                    {createMenuCategoryMutation.isPending || updateMenuSectionsMutation.isPending ? (
                      <button
                        disabled
                        type='button'
                        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center'
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
                        className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
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
        {/* Drawer add dish item */}
        <div
          id='drawer-right-add-dish-item'
          className='fixed top-[63px] bottom-0 right-0 z-[100] overflow-y-auto transition-transform translate-x-full bg-white w-full max-w-md dark:bg-gray-800'
          tabIndex={-1}
          aria-labelledby='drawer-right-label'
        >
          <div className=''>
            <div className='p-4 flex justify-between items-center'>
              <div id='drawer-right-label' className='text-xl font-semibold text-gray-900 dark:text-gray-400 truncate'>
                {currentAddFoodCategory}
              </div>
              <button
                type='button'
                onClick={() => {
                  setCurrentEditFoodItemId('')
                  const drawer = document.getElementById('drawer-right-add-dish-item')
                  drawer?.classList.toggle('translate-x-full')
                }}
                aria-controls='drawer-right-add-dish-item'
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
            <div className='h-[1px] w-full bg-gray-300'></div>
          </div>
          <div className=''>
            <FormProvider {...methodsFormAddFoodItem}>
              <form noValidate onSubmit={onSubmitAddNewFoodItem}>
                <div className='h-[394px] px-5 overflow-y-auto'>
                  <CommonInput
                    name='name'
                    register={registerAddNewFoodItem}
                    type='text'
                    label='Tên món ăn'
                    classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                    requiredInput={true}
                    placeholder='Gỏi cuốn, Phở, Bún chả vv.'
                    className='mt-3'
                    errorMessage={errorsAddNewFoodItem.name?.message}
                  />
                  <div className='mt-3 mb-5'>
                    <div className='mb-3 flex justify-between items-center'>
                      <label className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white'>
                        Danh mục
                      </label>
                      <button
                        type='button'
                        onClick={() => setIsOpenModalAddFoodType(true)}
                        className='flex items-center text-base font-normal tracking-wide text-blue-500 dark:text-blue-300'
                      >
                        <UilPlus></UilPlus>
                        <span>Thêm</span>
                      </button>
                    </div>
                    <SelectMutipleInput food_id={currentEditFoodItemId} setSelectedOptions={setSelectedOptions} />
                  </div>
                  <CommonInput
                    name='quantity'
                    register={registerAddNewFoodItem}
                    type='number'
                    label='Số lượng món ăn'
                    classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                    requiredInput={true}
                    className='mt-3'
                    errorMessage={errorsAddNewFoodItem.quantity?.message}
                  />
                  <TextArea
                    name='description'
                    register={registerAddNewFoodItem}
                    type='text'
                    label='Mô tả món ăn'
                    classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                    requiredInput={true}
                    placeholder='Thêm thông tin về món ăn...'
                    className='mt-3'
                    errorMessage={errorsAddNewFoodItem.description?.message}
                  />
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className='flex flex-col'>
                      <CommonInput
                        name='price'
                        register={registerAddNewFoodItem}
                        type='number'
                        label='Giá bán'
                        classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                        requiredInput={true}
                        placeholder='0.00 đ'
                        className='mt-3'
                        errorMessage={errorsAddNewFoodItem.price?.message}
                      />
                      <label className='inline-flex items-center cursor-pointer'>
                        <CommonInput
                          id='discount_status'
                          name='discount_status'
                          register={registerAddNewFoodItem}
                          type='checkbox'
                          toggleButton={true}
                          classNameInput='peer sr-only'
                        ></CommonInput>
                        <span className='ms-3 text-sm font-medium text-gray-900 dark:text-gray-300'>Giảm giá</span>
                      </label>
                    </div>
                    <CommonInput
                      name='cost_of_goods_sold'
                      register={registerAddNewFoodItem}
                      type='number'
                      label='Giá vốn món ăn'
                      classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                      requiredInput={true}
                      placeholder='0.00đ'
                      className='mt-3'
                      errorMessage={errorsAddNewFoodItem.cost_of_goods_sold?.message}
                    />
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                    {methodsFormAddFoodItem.watch('discount_status') && (
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
                          <div className='mt-1 text-red-600 min-h-[1.25rem] text-sm'>{fieldState.error?.message}</div>
                        </div>
                        <div className='col-span-1'>
                          <CommonInput
                            name='discount_value'
                            register={registerAddNewFoodItem}
                            type='number'
                            min={0}
                            label='Giá trị giảm'
                            classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                            placeholder=''
                            className='mt-3'
                            errorMessage={errorsAddNewFoodItem.discount_value?.message}
                          />
                        </div>
                        <div className='col-span-1 mt-3'>
                          <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'>
                            Giá bán rẻ
                          </div>
                          <div className='relative'>
                            <input
                              type='text'
                              value={handlePrice()}
                              disabled
                              readOnly
                              className='px-3 py-3.5 w-full outline-none border border-gray-300 focus:border-gray-500 rounded-md focus:shadow-sm'
                            />
                            <div className='absolute top-1/4 right-5 text-blue-600'>đ</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className='bg-white py-5 rounded-xl'>
                    <div className='flex justify-between items-center mb-5'>
                      <div className='font-bold text-xl leading-6'>Tùy chọn món ăn</div>
                      <button
                        onClick={() => handleClickAddFoodOptions()}
                        type='button'
                        className='flex items-center text-blue-600 hover:text-blue-400'
                      >
                        <UilPlus size={16}></UilPlus>
                        <span>Thêm</span>
                      </button>
                    </div>
                    <hr />
                    <div className='flex flex-wrap justify-between py-5 px-3'>
                      {/* Tên tùy chon */}
                      {options.length > 0 ? (
                        options.map((option, index) => (
                          <div key={index} className='flex flex-col w-full mb-3'>
                            <div className='flex justify-between items-center'>
                              <div className='flex gap-3'>
                                <div>{index + 1}</div>
                                <div className='font-semibold text-base'>
                                  {option.name} (Chọn {option.isSingleSelect ? 1 : option.options.length})
                                </div>
                              </div>
                              <div className='flex items-center gap-2'>
                                <button
                                  onClick={() => handleDeleteOption(index)}
                                  type='button'
                                  className='text-red-600 hover:text-red-400'
                                >
                                  <UilTrash size={20}></UilTrash>
                                </button>
                                <button
                                  onClick={() => handleEditOption(index)}
                                  type='button'
                                  className='text-blue-600 hover:text-blue-400'
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
                              </div>
                            </div>
                            <ul className='flex flex-wrap gap-3 mt-3 px-5'>
                              {option.options.map((item, index) => (
                                <li key={index} className='flex items-center gap-3'>
                                  <span>{item.name}</span>
                                  <span> - </span>
                                  <span className='font-bold text-blue-400'>
                                    {item.price} <span>đ</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      ) : (
                        <div className='text-center grid place-items-center w-full gap-y-5'>
                          <div>Chưa có tùy chọn</div>
                          <button
                            onClick={() => handleClickAddFoodOptions()}
                            type='button'
                            className='flex items-center text-blue-600 hover:text-blue-400'
                          >
                            <UilPlus size={16}></UilPlus>
                            <span>Thêm</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <hr />
                  </div>
                  <div className='mt-3'>
                    <div className='font-bold text-xl leading-6 px-3 mb-5'>Publish Store</div>
                    <hr />
                    <label className='inline-flex items-center cursor-pointer'>
                      <CommonInput
                        id='is_public'
                        name='publish_status'
                        register={registerAddNewFoodItem}
                        type='checkbox'
                      ></CommonInput>
                      <span className='ms-3 text-base font-medium text-gray-900 dark:text-gray-300'>
                        Hiển thị món ăn trong cửa hàng
                      </span>
                    </label>
                  </div>
                  <div className='mb-3 '>
                    <label className='inline-flex items-center cursor-pointer'>
                      <CommonInput
                        id='is_selling'
                        name='is_selling'
                        register={registerAddNewFoodItem}
                        type='checkbox'
                      ></CommonInput>
                      <span className='ms-3 text-base font-medium text-gray-900 dark:text-gray-300'>
                        Đăng bán món ăn trên{' '}
                        <span className='font-bold'>
                          TTFo<span className='text-apps-pink'>o</span>d
                        </span>
                      </span>
                    </label>
                  </div>
                  <hr />
                  <div className='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3 mt-5'>
                    Hình ảnh món ăn <span className='text-red-500'>*</span>
                  </div>
                  <div className='flex mt-3 items-center'>
                    <InputFile onChange={handleChangeFileFoodImage}></InputFile>
                    <div className='border ms-10 border-dashed border-blue-300 w-32 h-32'>
                      <img
                        src={previewImage || '/images/food_default.svg'}
                        alt='food-image'
                        className='h-full w-full object-cover'
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className='mt-3'>
                    <div className='h-[1px] w-full bg-gray-300'></div>
                    <div className='flex justify-center gap-3 px-5 py-3'>
                      {uploadImageMutation.isPending || createFoodMutation.isPending ? (
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
                          className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                        >
                          <span className='me-2'>Lưu</span>
                          <Save />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
        {/* Modal add food type */}
        <Modal
          children={
            <div className='py-2'>
              <div className='flex px-4 py-2.5 md:px-5 justify-between items-center'>
                <div>
                  <h5 className='text-lg font-semibold text-gray-900 dark:text-gray-400'>Thêm danh mục món ăn</h5>
                  <p></p>
                </div>
                {/* add button close */}
                <button
                  type='button'
                  onClick={() => setIsOpenModalAddFoodType(false)}
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
                <FormProvider {...methodsFormAddCategory}>
                  <form noValidate onSubmit={onSubmitAddNewCategory}>
                    <CommonInput
                      name='name'
                      register={registerAddNewCategory}
                      type='text'
                      label='Tên danh mục'
                      classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                      requiredInput={true}
                      placeholder='Đồ ăn, Đồ uống, Đồ chay vv.'
                      className='mt-3'
                      errorMessage={errorsAddNewCategory.name?.message}
                    />
                    <TextArea
                      name='description'
                      register={registerAddNewCategory}
                      type='text'
                      label='Mô tả danh mục'
                      classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-3'
                      requiredInput={true}
                      placeholder='Thêm thông tin về loại món ăn...'
                      className='mt-3'
                      errorMessage={errorsAddNewCategory.description?.message}
                    />
                    <div className='flex justify-end gap-x-3 mt-5'>
                      {createCategoryMutation.isPending ? (
                        <button
                          disabled
                          type='button'
                          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center'
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
                          className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                        >
                          <span className='me-2'>Lưu</span>
                          <Save />
                        </button>
                      )}
                    </div>
                  </form>
                </FormProvider>
              </div>
            </div>
          }
          showDialog={isOpenModalAddFoodType}
        ></Modal>
        <Modal
          width='max-w-2xl'
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
                          onClick={addNewEditForm}
                        >
                          <UilPlus />
                          <span>Thêm</span>
                        </button>
                        <div className='h-52 overflow-scroll'>
                          {editAdditionalForms.map((form, index) => (
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
                                  onChange={(e) => handleEditInputChange(index, e)}
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
                                  onChange={(e) => handleEditInputChange(index, e)}
                                />
                              </div>
                              <button
                                type='button'
                                className='text-red-600 hover:text-red-400 self-center col-span-1'
                                onClick={() => deleteEditForm(index)}
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
                      {createCategoryMutation.isPending ? (
                        <button
                          disabled
                          type='button'
                          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center'
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
                          className='inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
                        >
                          <span className='me-2'>Lưu</span>
                          <Save />
                        </button>
                      )}
                    </div>
                  </form>
                </FormProvider>
              </div>
            </div>
          }
          showDialog={openModalAddFoodOptions}
        ></Modal>
        <Modal
          showDialog={isOpenModalDeleteMenuSection}
          width='max-w-xl'
          children={
            <div className='p-5 flex flex-col gap-5'>
              <div className='flex justify-between items-center'>
                <h1 className='text-base md:text-xl font-bold'>Xóa phần danh mục này trong thực đơn?</h1>
                <button
                  type='button'
                  onClick={() => setIsOpenModalDeleteMenuSection(false)}
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
              <div>
                <span className='font-bold text-base'>{menuSectionSelected?.name}</span> và các món ăn trong danh mục
                này sẽ bị xóa sẽ bị xóa và không thể khôi phục được.
              </div>
              <div className='flex justify-end gap-5 items-center'>
                <button
                  className='text-red-500 border border-red-200 hover:text-white hover:bg-red-600 px-5 py-2 rounded-3xl'
                  type='button'
                  onClick={() => setIsOpenModalDeleteMenuSection(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  className='text-white bg-red-600 px-5 py-2 rounded-3xl'
                  type='button'
                  onClick={() => handleDeleteMenuSection(menuSectionSelected?._id as string)}
                >
                  Xóa phần
                </button>
              </div>
            </div>
          }
        ></Modal>
        {/* Modal delete menu */}
        <Modal
          showDialog={isOpenModalDeleteMenu}
          width='max-w-xl'
          children={
            <div className='p-5 flex flex-col gap-5'>
              <div className='flex justify-between items-center'>
                <h1 className='text-base md:text-xl font-bold'>Bạn muốn xóa thực đơn "{activeMenu?.name}"?</h1>
                <button
                  type='button'
                  onClick={() => setIsOpenModalDeleteMenu(false)}
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
              <div>
                Sau khi xóa, thực đơn này và các món ăn thuộc các danh mục thực đơn sẽ không thể khôi phục được.
              </div>
              <div className='flex justify-end gap-5 items-center'>
                <button
                  className='text-red-500 border border-red-200 hover:text-white hover:bg-red-600 px-5 py-2 rounded-3xl'
                  type='button'
                  onClick={() => setIsOpenModalDeleteMenu(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  className='text-white bg-red-600 px-5 py-2 rounded-3xl'
                  type='button'
                  onClick={() => handleDeleteMenu()}
                >
                  Xóa thực đơn
                </button>
              </div>
            </div>
          }
        ></Modal>
      </div>
    </div>
  )
}
export default Menu
