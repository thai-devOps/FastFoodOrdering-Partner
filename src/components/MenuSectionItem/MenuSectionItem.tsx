import { MoreHorizontal, Trash2, ChevronUp, Pencil } from 'lucide-react'
import React from 'react'
import { MenuCategory } from '~/types/menu_section.type'
import { CSSTransition } from 'react-transition-group'
interface MenuSectionItemProps {
  item: MenuCategory
}
const MenuSectionItem: React.FC<MenuSectionItemProps> = ({ item }) => {
  return (
    <div className='flex flex-col'>
      <div>
        <div className='flex justify-between items-center bg-white py-3 px-3 shadow-md'>
          <div className='flex items-center gap-3'>
            <span className='inline-block text-xl font-medium tracking-tight text-gray-900 dark:text-white'>
              Món Khai Vị
            </span>
            <button
              onClick={() => {
                setIsEditMenuSection(true)
                methodsFormAddMenuSection.reset({
                  _id: activeMenu?._id,
                  name: activeMenu?.name,
                  description: activeMenu?.description
                })
                const drawer = document.getElementById('drawer-right-add-menu-section')
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
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => {
                const drawer = document.getElementById('drawer-right-add-dish-item')
                drawer?.classList.toggle('translate-x-full')
              }}
              className='relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800'
            >
              <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0'>
                Thêm món ăn
              </span>
            </button>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setIsOpenMenuSectionDetail(!isOpenMenuSectionDetail)}
                aria-haspopup='true'
                aria-expanded={isOpenMenuSectionDetail ? 'true' : 'false'}
                className='rounded-full hover:bg-blue-600 hover:text-white text-blue-700 bg-white py-2 px-2 cursor-pointer transition duration-75 ease-linear border'
              >
                <MoreHorizontal />
              </button>
              <CSSTransition
                in={isOpenMenuSectionDetail}
                timeout={20}
                classNames='dropdown'
                unmountOnExit
                onExited={() => setIsOpenMenuSectionDetail(false)}
              >
                <div className='absolute z-10 left-1/2 transform -translate-x-1/2 right-0 mt-2 origin-top-right bg-white border border-gray-200 divide-y w-56 divide-gray-100 rounded-xl shadow-lg'>
                  <div className='absolute left-1/2 transform -translate-x-1/2 w-0 h-0 top-[-20px] right-4 border-solid border-[12px] border-white border-t-transparent border-r-transparent border-l-transparent'></div>
                  <div className='py-2'>
                    <button
                      type='button'
                      className='inline-flex items-center w-full py-2 px-2.5 text-sm gap-3 justify-start text-red-600 tracking-wide hover:bg-red-100'
                    >
                      <Trash2 />
                      <span>Xóa danh mục thực đơn</span>
                    </button>
                  </div>
                </div>
              </CSSTransition>
            </div>
            <button
              type='button'
              className='rounded-full border hover:bg-blue-600 hover:text-white text-blue-700 bg-white py-2 px-2 cursor-pointer transition duration-75 ease-linear'
            >
              <ChevronUp />
            </button>
          </div>
        </div>
      </div>
      <hr />
      <div className='grid grid-cols-8 gap-3 bg-white px-3 py-4'>
        <div className='col-span-4 self-center '>
          <div className='font-normal text-lg'>Gỏi cuốn</div>
          <p className='truncate text-xs tracking-wider'>
            Một món ăn truyền thống của Việt Nam, được làm từ các nguyên liệu như tôm, thịt bò, rau sống và bún
          </p>
        </div>
        <div className='col-span-1 self-center'>
          <div className='font-normal text-lg'>35.000₫</div>
        </div>
        <div className='col-span-1 self-center'>
          <img
            src='https://static.wixstatic.com/media/11062b_e0b9fbdff92e40d8884559e0afedfa16~mv2_d_6451_4301_s_4_2.jpg/v1/fill/w_48,h_48,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/11062b_e0b9fbdff92e40d8884559e0afedfa16~mv2_d_6451_4301_s_4_2.jpg'
            alt='food-items'
            className='w-12 h-12 rounded-md object-cover'
          />
        </div>
        <div className='col-span-1 self-center'>
          <button className='text-gray-900 hover:text-blue-600 inline-flex items-center'>
            <Pencil className='me-3' size={18} />
            <span>Sửa</span>
          </button>
        </div>
        {/* Delete button */}
        <div className='col-span-1 self-center'>
          <button className='text-red-600 hover:text-red-800 inline-flex items-center'>
            <Trash2 className='me-3' size={18} />
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  )
}
export default MenuSectionItem
