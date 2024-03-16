import { MoreHorizontal, Trash2 } from 'lucide-react'
import '~/pages/Menu/dropdown.css'
import { CSSTransition } from 'react-transition-group'
import { formatCurrency } from '~/utils/utils'
import { UseFormReturn } from 'react-hook-form'
import { Food } from '~/types/food.type'
import { MenuSection } from '~/types/menu_section.type'
import { NavLink, useNavigate } from 'react-router-dom'
import { partnerPaths } from '~/routes/partnerRoute'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FOOD_API } from '~/apis/food.api'
import Toast from '../Toast'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { DiscountType } from '~/enums'
import ModalZoom from '../ModalZoom'
interface Props {
  foodItem: Food
  index: number
  openDropdownIndex: any
  setOpenDropdownIndex: React.Dispatch<any>
  toggleDropdown: (id: string) => void
  setCurrentEditFoodItemId: React.Dispatch<React.SetStateAction<string>>
  setCurrentAddFoodCategory: React.Dispatch<React.SetStateAction<string>>
  methodsFormAddFoodItem: UseFormReturn<
    {
      _id?: string | undefined
      discount_type?: string | undefined
      discount_value?: number | undefined
      name: string
      description: string
      cost_of_goods_sold: number
      price: number
      publish_status: NonNullable<boolean | undefined>
      is_selling: NonNullable<boolean | undefined>
      quantity: number
      discount_status: NonNullable<boolean | undefined>
    },
    any,
    undefined
  >
  menuCategory: MenuSection
}
const FoodItem: React.FC<Props> = ({ foodItem, index, openDropdownIndex, setOpenDropdownIndex, toggleDropdown }) => {
  const [showToast, setShowToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    is_open: boolean
  }>({
    message: 'Thông báo mẫu',
    type: 'success',
    is_open: false
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteFoodItemMutation = useMutation({
    mutationFn: (id: string) => FOOD_API.delete(id)
  })
  const handleDeleteFoodItem = (id: string) => {
    deleteFoodItemMutation.mutate(id, {
      onSuccess: async () => {
        setOpenDropdownIndex(null)
        setShowToast({
          message: 'Xóa món ăn thành công',
          type: 'success',
          is_open: false
        })
        setTimeout(() => {
          setShowToast({
            message: '',
            type: 'success',
            is_open: false
          })
        }, 3000)
        await queryClient.invalidateQueries({
          queryKey: ['dataFoodItems']
        })
      },
      onError: (error) => {
        setShowToast({
          message: error.message,
          type: 'error',
          is_open: false
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
  const hanadlePriceAfter = () => {
    const discountType = foodItem.discount.type
    const discountValue = foodItem.discount.value
    if (discountType === DiscountType.PERCENTAGE) {
      return foodItem.price - (foodItem.price * discountValue) / 100
    } else if (discountType === DiscountType.AMOUNT) {
      return foodItem.price - discountValue
    } else {
      return foodItem.price
    }
  }
  return (
    <>
      {showToast.is_open && <Toast message={showToast.message} type={showToast.type} />}
      <div className='grid grid-cols-12 gap-10 bg-white px-3 py-4 hover:bg-gray-100 border-2 border-white hover:shadow-md duration-75 ease-linear'>
        {/* stt */}
        <div className='col-span-1 self-center flex justify-center items-center '>
          <span className='font-bold rounded-full bg-gray-50 px-4 py-2'>{index + 1}</span>
        </div>
        {/* image */}
        <div className='col-span-2 self-center flex justify-center'>
          <img src={foodItem.image.url} alt='food-items' className='w-12 h-12 rounded-md object-cover' />
        </div>
        {/* dished name and description */}
        <NavLink
          to={{
            pathname: partnerPaths.menu_food_detail,
            search: `?id=${foodItem._id}`
          }}
          className='col-span-6 self-center flex flex-col gap-y-2 justify-start'
        >
          <div className='font-normal text-lg'>{foodItem.name}</div>
          <p className='text-xs tracking-wide truncate'>{foodItem.description}</p>
        </NavLink>
        {/* handle discount price */}
        {foodItem.discount.status && (
          <>
            {/* price before discount */}
            <div className='col-span-1 line-through self-center  flex justify-center'>
              <div className='text-base font-normal'>{formatCurrency(foodItem.price)}₫</div>
            </div>
            {/* price after discount */}
            <div className='col-span-1 self-center  flex justify-center'>
              <div className='text-lg font-bold text-blue-400'>{formatCurrency(hanadlePriceAfter())}₫</div>
            </div>
          </>
        )}
        {!foodItem.discount.status && (
          <>
            {/* price before discount */}
            <div className='col-span-2 self-center  flex justify-end'>
              <div className='text-lg font-bold text-blue-400'>{formatCurrency(foodItem.price)}₫</div>
            </div>
          </>
        )}
        {/* action */}
        <div className='col-span-1 self-center flex justify-center'>
          <div className='relative'>
            <button
              type='button'
              aria-haspopup='true'
              aria-expanded={openDropdownIndex === foodItem._id ? 'true' : 'false'}
              className='rounded-full hover:bg-blue-400 hover:text-white text-blue-700 bg-white py-1 px-1 cursor-pointer transition duration-75 ease-linear me-2'
              onClick={() => toggleDropdown(foodItem._id)}
            >
              <MoreHorizontal />
            </button>
            {/* Dropdown menu */}
            {openDropdownIndex === foodItem._id && (
              <CSSTransition
                in={openDropdownIndex === foodItem._id}
                timeout={10}
                classNames='dropdown'
                unmountOnExit
                onExited={() => setOpenDropdownIndex(null)}
              >
                <div className='absolute z-10 top-1/2 transform -translate-y-[55%] right-14 mt-2 bg-white border border-gray-200 divide-y w-48 divide-gray-100 rounded-xl shadow-sm'>
                  <div className='absolute top-1/2 transform rotate-90 -right-6 w-0 h-0 -translate-y-[40%] border-solid border-[12px] border-gray-50 border-t-transparent border-r-transparent border-l-transparent'></div>
                  {/* Dropdown items */}
                  <ul className='py-2 text-sm text-gray-700 dark:text-gray-200'>
                    <li>
                      <button
                        type='button'
                        onClick={() => navigate(`${partnerPaths.menu_food_detail}?id=${foodItem._id}`)}
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
                      onClick={() => handleDeleteFoodItem(foodItem._id)}
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
      </div>
    </>
  )
}
export default FoodItem
