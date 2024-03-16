import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'react-toastify'
import { MENUS_API } from '~/apis/menu.api'
import { IMenu } from '~/types/menu.type'

interface Props {
  menu: IMenu
  index: number
  setShowToast: React.Dispatch<
    React.SetStateAction<{
      message: string
      type: 'success' | 'error' | 'warning' | 'info'
      is_open: boolean
    }>
  >
  methodsFormAddMenu: UseFormReturn<
    {
      _id?: string | undefined
      name: string
      description: string
      is_draft: NonNullable<boolean | undefined>
      is_active: NonNullable<boolean | undefined>
    },
    any,
    undefined
  >
  setIsEditMenu: (value: React.SetStateAction<boolean>) => void
}
const MenuItem: React.FC<Props> = ({ menu, index, methodsFormAddMenu, setIsEditMenu, setShowToast }) => {
  const deleteMenuItemMutation = useMutation({
    mutationFn: (id: string) => MENUS_API.delete(id)
  })
  const queryClient = useQueryClient()
  const handleDeleteMenu = () => {
    deleteMenuItemMutation.mutate(menu._id, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['menusDataPaginated']
        })
        setShowToast({
          message: 'Xóa thực đơn thành công',
          type: 'success',
          is_open: true
        })
        setTimeout(() => {
          setShowToast((prev) => ({ ...prev, is_open: false }))
        }, 3000)
      }
    })
  }
  let renderLabelisActive: React.ReactNode = null
  let renderLabelisDraft: React.ReactNode = null
  if (menu.is_active) {
    renderLabelisActive = (
      <span className='px-2 py-1 text-xs font-semibold text-green-900 bg-green-200 rounded-full dark:bg-green-600 dark:text-green-100'>
        Đang sử dụng
      </span>
    )
  } else {
    renderLabelisActive = (
      <span className='px-2 py-1 text-xs font-semibold text-red-900 bg-red-200 rounded-full dark:bg-red-600 dark:text-red-100'>
        Chưa được sử dụng
      </span>
    )
  }
  if (!menu.is_draft) {
    renderLabelisDraft = (
      <span className='px-2 py-1 text-xs font-semibold text-green-900 bg-green-200 rounded-full dark:bg-green-600 dark:text-green-100'>
        Công khai
      </span>
    )
  } else {
    renderLabelisDraft = (
      <span className='px-2 py-1 text-xs font-semibold text-red-900 bg-red-200 rounded-full dark:bg-red-600 dark:text-red-100'>
        Bản nháp
      </span>
    )
  }
  return (
    <tr className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'>
      <td className='w-4 p-4'>
        <div className='flex items-center'>{index + 1}</div>
      </td>
      <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
        {menu.name}
      </th>
      <td className='px-6 py-4'>{menu.description}</td>
      <td className='px-6 py-4 text-center'>{renderLabelisDraft}</td>
      <td className='px-6 py-4 text-center'>{renderLabelisActive}</td>
      <td className='flex items-center justify-center px-6 py-4'>
        <button
          type='button'
          onClick={() => {
            methodsFormAddMenu.reset({
              _id: menu?._id,
              name: menu?.name,
              description: menu?.description,
              is_draft: menu?.is_draft,
              is_active: menu?.is_active
            })
            setIsEditMenu(true)
            const drawer = document.getElementById('drawer-right-add-new-menu')
            drawer?.classList.toggle('translate-x-full')
          }}
          className='font-medium text-blue-600 dark:text-blue-500 hover:underline'
        >
          <svg viewBox='0 0 24 24' fill='currentColor' width={24} height={24} className='text-[#3899ec] cursor-pointer'>
            <path d='M16.679,5.60187506 L18.381,7.30587506 C19.207,8.13287506 19.207,9.47787506 18.381,10.3058751 L10.211,18.4858751 L4,19.9998751 L5.512,13.7818751 L13.682,5.60187506 C14.481,4.79987506 15.878,4.79887506 16.679,5.60187506 Z M8.66091072,16.0462125 L9.973,17.3598751 L15.625,11.7018751 L12.289,8.36087506 L6.637,14.0198751 L7.95422762,15.3386821 L11.1467061,12.1463747 C11.3419735,11.9511178 11.6585559,11.9511262 11.8538129,12.1463936 C12.0490698,12.341661 12.0490613,12.6582435 11.8537939,12.8535004 L8.66091072,16.0462125 Z M16.306,11.0198751 L17.7,9.62387506 C18.15,9.17287506 18.15,8.43787506 17.7,7.98687506 L15.998,6.28287506 C15.561,5.84587506 14.801,5.84687506 14.364,6.28287506 L12.97,7.67887506 L16.306,11.0198751 Z M5.426,18.5738751 L8.995,17.7438751 L6.254,14.9988751 L5.426,18.5738751 Z' />
          </svg>
        </button>
        {deleteMenuItemMutation.isPending && (
          <button className='flex justify-center items-center ms-3 font-medium'>
            <svg
              aria-hidden='true'
              role='status'
              className='inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600'
              viewBox='0 0 100 101'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                fill='currentColor'
              />
              <path
                d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                fill='#1C64F2'
              />
            </svg>
          </button>
        )}
        {!deleteMenuItemMutation.isPending && (
          <button onClick={handleDeleteMenu} type='button' className='font-medium text-red-600 dark:text-red-500 ms-3'>
            <Trash2 className='w-5 h-5'></Trash2>
          </button>
        )}
      </td>
    </tr>
  )
}
export default MenuItem
