import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, MoreHorizontal, Trash2 } from 'lucide-react'
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import authApi from '~/apis/authApi'
import { FOOD_API } from '~/apis/food.api'
import { MENUS_API } from '~/apis/menu.api'
import { partnerPaths } from '~/routes/partnerRoute'
import { Category } from '~/types/category.type'
import { Food } from '~/types/food.type'
import { FoodCategory } from '~/types/food_category.type'
import { IMenu } from '~/types/menu.type'
import { MenuSection } from '~/types/menu_section.type'
import { formatCurrency } from '~/utils/utils'

interface Props {
  food: Food
  index: number
  setShowToast: React.Dispatch<
    React.SetStateAction<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; is_open: boolean }>
  >
}
const FoodManageItem: React.FC<Props> = ({ food, index, setShowToast }) => {
  const { data: menuSectionData, isLoading: isLoadingMenuSection } = useQuery({
    queryKey: ['menu', food.menu_section_id],
    queryFn: () => authApi.getMenuSectionById(food.menu_section_id),
    enabled: !!food.menu_section_id
  })
  const { data: dataCategories, isLoading: isLoadingCateggories } = useQuery({
    queryKey: ['dataCategories'],
    queryFn: () => authApi.getCategories()
  })
  const categories_db = dataCategories?.data?.data as Category[]
  const { data: foodCategoriesData, isLoading: isLoadingFoodCategories } = useQuery({
    queryKey: ['foodCategoriesData', food._id],
    queryFn: () => authApi.getFoodCategories(food._id),
    enabled: !!food._id
  })
  const foodCategories = foodCategoriesData?.data?.data as FoodCategory[]
  // find category name by category id in foodCategories array and categories_db array
  const categoryNames = foodCategories?.map((foodCategory) => {
    const category = categories_db?.find((category) => category._id === foodCategory.category_id)
    return category?.name
  })
  // remove undefined value in categoryNames array
  const categoryNamesFiltered = categoryNames?.filter((categoryName) => categoryName !== undefined)
  // join categoryNamesFiltered array to string
  const categoryNamesString = categoryNamesFiltered?.join(', ')
  let renderCategoryNames: React.ReactNode = null

  const [openDropdownIndex, setOpenDropdownIndex] = React.useState<string>('')
  const toggleDropdown = (id: string) => {
    setOpenDropdownIndex(openDropdownIndex === id ? '' : id)
  }

  const menu_section = menuSectionData?.data?.data as MenuSection
  const { data: menuData, isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menuFoodDataItem', menu_section?.menuId],
    queryFn: () => MENUS_API.getById(menu_section?.menuId),
    enabled: !!menu_section?.menuId
  })
  const queryClient = useQueryClient()
  const deleteFoodItemMutation = useMutation({
    mutationFn: (id: string) => FOOD_API.delete(id)
  })
  const handleDeleteFoodItem = (id: string) => {
    deleteFoodItemMutation.mutate(id, {
      onSuccess: async () => {
        setOpenDropdownIndex('')
        setShowToast({
          message: 'Xóa món ăn thành công',
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
          queryKey: ['foodData']
        })
      },
      onError: (error) => {
        setShowToast({
          message: error.message,
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
  }
  const menu = menuData?.data?.data as IMenu
  let renderLabelStock: React.ReactNode = null
  if (food.quantity === 0) {
    renderLabelStock = (
      <span className='px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg dark:bg-red-600 dark:text-red-100'>
        Hết hàng
      </span>
    )
  }
  if (food.quantity > 0 && food.quantity <= 10) {
    renderLabelStock = (
      <span className='px-2 py-1 text-xs font-semibold text-white bg-orange-500 rounded-lg dark:bg-orange-600 dark:text-orange-100'>
        Sắp hết hàng
      </span>
    )
  }
  if (food.quantity > 10) {
    renderLabelStock = (
      <span className='px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-lg dark:bg-green-600 dark:text-green-100'>
        Còn hàng
      </span>
    )
  }
  let renderMenuName: React.ReactNode = null
  if (isLoadingMenu || isLoadingMenuSection) {
    renderMenuName = (
      <td>
        <div className='flex items-center justify-start p-5 animate-pulse'>
          <div className='w-full h-4 bg-gray-300 rounded'></div>
        </div>
      </td>
    )
  }
  if (!isLoadingMenu && !isLoadingMenuSection) {
    renderMenuName = (
      <td scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
        <div>{menu?.name.length > 20 ? menu?.name.substring(0, 20) + '...' : menu?.name}</div>
      </td>
    )
  }
  if (isLoadingCateggories || isLoadingFoodCategories) {
    renderCategoryNames = (
      <td>
        <div className='flex items-center justify-start p-5 animate-pulse'>
          <div className='w-full h-4 bg-gray-300 rounded'></div>
        </div>
      </td>
    )
  }
  if (!isLoadingCateggories && !isLoadingFoodCategories) {
    renderCategoryNames = (
      <td className='px-6 py-4 text-center'>
        {categoryNamesFiltered?.map((categoryName, index) => <div key={index}>{categoryName}</div>)}
      </td>
    )
  }
  const navigate = useNavigate()
  return (
    <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
      <td className='w-4 p-4'>
        <div className='flex items-center'>{index + 1}</div>
      </td>
      {renderMenuName}
      <td scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
        <div>{food.name.length > 20 ? food.name.substring(0, 20) + '...' : food.name}</div>
      </td>
      <td className='px-6 py-4'>
        <div className='relative w-full pt-[100%]'>
          <img
            src={food.image.url}
            alt={food.name}
            className='absolute top-0 left-0 h-full w-full bg-white object-cover rounded-lg'
          />
        </div>
      </td>
      <td className='px-6 py-4 text-center'>
        <div className='col-span-1 self-center  flex justify-center'>
          <div className='text-lg font-bold text-blue-400'>{formatCurrency(food.price)}₫</div>
        </div>
      </td>
      {renderCategoryNames}
      <td className='px-6 py-4 text-center'>{renderLabelStock}</td>
      <td className='px-6 py-4 text-center'>
        <div className='col-span-1 self-center flex justify-center'>
          <div className='relative'>
            <button
              type='button'
              aria-haspopup='true'
              aria-expanded={openDropdownIndex === food._id ? 'true' : 'false'}
              className='rounded-full hover:bg-blue-400 hover:text-white text-blue-700 bg-white py-1 px-1 cursor-pointer transition duration-75 ease-linear me-2'
              onClick={() => toggleDropdown(food._id)}
            >
              <MoreHorizontal />
            </button>
            {/* Dropdown menu */}
            {openDropdownIndex === food._id && (
              <CSSTransition
                in={openDropdownIndex === food._id}
                timeout={10}
                classNames='dropdown'
                unmountOnExit
                onExited={() => setOpenDropdownIndex('')}
              >
                <div className='absolute z-10 top-1/2 transform -translate-y-[55%] right-14 mt-2 bg-white border border-gray-200 divide-y w-48 divide-gray-100 rounded-xl shadow-sm'>
                  <div className='absolute top-1/2 transform rotate-90 -right-6 w-0 h-0 -translate-y-[40%] border-solid border-[12px] border-gray-50 border-t-transparent border-r-transparent border-l-transparent'></div>
                  {/* Dropdown items */}
                  <ul className='py-2 text-sm text-gray-700 dark:text-gray-200'>
                    <li>
                      <button
                        type='button'
                        onClick={() => navigate(`/menu/${partnerPaths.menu_food_detail}?id=${food._id}`)}
                        className='inline-flex w-full text-sm gap-2 items-center px-4 py-2 hover:bg-[#EAF7FF] hover:text-[#3899ec]'
                      >
                        <svg viewBox='0 0 24 24' fill='currentColor' width={25} height={25} className='text-[#3899ec]'>
                          <path d='M16.679,5.60187506 L18.381,7.30587506 C19.207,8.13287506 19.207,9.47787506 18.381,10.3058751 L10.211,18.4858751 L4,19.9998751 L5.512,13.7818751 L13.682,5.60187506 C14.481,4.79987506 15.878,4.79887506 16.679,5.60187506 Z M8.66091072,16.0462125 L9.973,17.3598751 L15.625,11.7018751 L12.289,8.36087506 L6.637,14.0198751 L7.95422762,15.3386821 L11.1467061,12.1463747 C11.3419735,11.9511178 11.6585559,11.9511262 11.8538129,12.1463936 C12.0490698,12.341661 12.0490613,12.6582435 11.8537939,12.8535004 L8.66091072,16.0462125 Z M16.306,11.0198751 L17.7,9.62387506 C18.15,9.17287506 18.15,8.43787506 17.7,7.98687506 L15.998,6.28287506 C15.561,5.84587506 14.801,5.84687506 14.364,6.28287506 L12.97,7.67887506 L16.306,11.0198751 Z M5.426,18.5738751 L8.995,17.7438751 L6.254,14.9988751 L5.426,18.5738751 Z' />
                        </svg>
                        <span>Chỉnh sửa món ăn</span>
                      </button>
                    </li>
                  </ul>
                  <div className='py-2'>
                    <button
                      type='button'
                      onClick={() => handleDeleteFoodItem(food._id)}
                      className='inline-flex items-center w-full py-2 px-2.5 text-sm gap-3 justify-start text-red-600 tracking-wide hover:bg-red-100'
                    >
                      <Trash2 className='w-[25px] h-5' />
                      <span>Xóa món ăn</span>
                    </button>
                  </div>
                </div>
              </CSSTransition>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}
export default FoodManageItem
