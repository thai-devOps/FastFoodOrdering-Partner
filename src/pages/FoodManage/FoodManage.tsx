import { ArrowDownWideNarrow, ArrowUpWideNarrow, Download, Filter, MoveLeft, Plus, Save, Search } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { partnerPaths } from '~/routes/partnerRoute'
import Pagination from '~/components/Pagination/Pagination'
import useQueryConfig from '~/hooks/useQueryConfig'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MENUS_API } from '~/apis/menu.api'
import { IMenu, MenuListConfig } from '~/types/menu.type'
import { ListPagination } from '~/types/utils.type'
import MenuItem from '~/components/MenuItem'
import EmptyRow from '~/components/EmptyRow'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { MenuRequestType, menuSchema } from '~/utils/rules'
import { toast } from 'react-toastify'
import CommonInput from '~/components/CommonInput'
import TextArea from '~/components/AreaInput'
import { Helmet } from 'react-helmet-async'
import Toast from '~/components/Toast'
import { SHOP_API } from '~/apis/shops.api'
import { Shop } from '~/types/shop.type'
import { FOOD_API } from '~/apis/food.api'
import FoodManageItem from '~/components/FoodManageItem'
import { Food } from '~/types/food.type'
import LoadingTableFoodSkeleton from '~/components/LoadingTableFoodSkeleton'
import Loading from '~/components/Loading'
import SelectMutipleInput from '~/components/SelectMutipleInput'
import { SORT_BY, SellingStatus } from '~/enums'
import Modal from '~/components/Modal'
const FoodManage: React.FC = () => {
  const [strSearch, setStrSearch] = useState<string>('')
  const [order, setOrder] = useState<string>('asc')
  const [selectedOptions, setSelectedOptions] = useState<any>()
  const [categories, setCategories] = useState<string[]>([])
  const [is_selling, setIsSelling] = useState<SellingStatus | undefined>(undefined)
  const [quantity_status, setQuantityStatus] = useState<string | undefined>(undefined)
  const [showMultipleSelect, setShowMultipleSelect] = useState<boolean>(false)
  const [openModalDownloadFoodCSV, setOpenModalDownloadFoodCSV] = useState<boolean>(false)
  const [downloadState, setDownloadState] = useState<string>('all')
  const [limit, setLimit] = useState<string>('5')
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    is_open: boolean
  }>({ message: '', type: 'success', is_open: false })
  const [isEditMenu, setIsEditMenu] = useState<boolean>(false)
  const [publish_status, setPublishStatus] = useState<string | undefined>(undefined)
  const [sort_by, setSortBy] = useState<SORT_BY>(SORT_BY.newest)
  const queryConfig = useQueryConfig()
  queryConfig.name = strSearch
  queryConfig.order_by = order
  queryConfig.limit = limit
  queryConfig.quantity = quantity_status
  queryConfig.publish_status = publish_status
  queryConfig.is_selling = is_selling
  queryConfig.sort_by = sort_by
  const convertArrayToString =
    (selectedOptions as { value: string; label: string }[])?.map((option, _) => option.value) || ([] as string[])
  const handleChangeStrSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value
    setStrSearch(searchTerm)
  }
  queryConfig.categories = convertArrayToString.join(',')
  const { data: shopsData, isLoading: isLoadingShop } = useQuery({
    queryKey: ['shopsData'],
    queryFn: () => SHOP_API.getByPartnerId()
  })
  const shop = shopsData?.data.data as Shop
  const { data: foodData, isLoading: isLoadingFoodData } = useQuery({
    queryKey: ['foodData', queryConfig],
    queryFn: () => FOOD_API.getByShopIdPagination(shop?._id, queryConfig),
    enabled: !!shop?._id
  })
  const { data: foodAll } = useQuery({
    queryKey: ['foodData'],
    queryFn: () => FOOD_API.getByShopId(shop?._id),
    enabled: !!shop?._id
  })
  const food_all = foodAll?.data?.data as Food[]
  const foodDataItems = foodData?.data.data as ListPagination<Food>

  const handleCountFilter = () => {
    let count = 0
    if (publish_status) count++
    if (is_selling) count++
    if (quantity_status) count++
    if (selectedOptions?.length > 0) count++
    return count
  }
  let renderSortBy: React.ReactNode = null
  if (sort_by === SORT_BY.newest && order === 'asc') {
    renderSortBy = (
      <>
        <ArrowUpWideNarrow className='w-5 h-5 text-blue-400'></ArrowUpWideNarrow>
        <span>Mới nhất</span>
      </>
    )
  }
  if (sort_by === SORT_BY.newest && order === 'desc') {
    renderSortBy = (
      <>
        <ArrowDownWideNarrow className='w-5 h-5 text-blue-400'></ArrowDownWideNarrow>
        <span>Mới nhất</span>
      </>
    )
  }
  if (sort_by === SORT_BY.name && order === 'asc') {
    renderSortBy = (
      <>
        <ArrowUpWideNarrow className='w-5 h-5 text-blue-400'></ArrowUpWideNarrow>
        <span>Theo tên</span>
      </>
    )
  }
  if (sort_by === SORT_BY.name && order === 'desc') {
    renderSortBy = (
      <>
        <ArrowDownWideNarrow className='w-5 h-5 text-blue-400'></ArrowDownWideNarrow>
        <span>Theo tên</span>
      </>
    )
  }
  if (sort_by === SORT_BY.price && order === 'asc') {
    renderSortBy = (
      <>
        <ArrowUpWideNarrow className='w-5 h-5 text-blue-400'></ArrowUpWideNarrow>
        <span>Theo giá</span>
      </>
    )
  }
  if (sort_by === SORT_BY.price && order === 'desc') {
    renderSortBy = (
      <>
        <ArrowDownWideNarrow className='w-5 h-5 text-blue-400'></ArrowDownWideNarrow>
        <span>Theo giá</span>
      </>
    )
  }
  if (sort_by === SORT_BY.sold && order === 'asc') {
    renderSortBy = (
      <>
        <ArrowUpWideNarrow className='w-5 h-5 text-blue-400'></ArrowUpWideNarrow>
        <span>Theo số lượng bán</span>
      </>
    )
  }
  if (sort_by === SORT_BY.sold && order === 'desc') {
    renderSortBy = (
      <>
        <ArrowDownWideNarrow className='w-5 h-5 text-blue-400'></ArrowDownWideNarrow>
        <span>Theo số lượng bán</span>
      </>
    )
  }
  let renderEmptyRow: React.ReactNode = (
    <EmptyRow
      title='Không có món ăn nào phù với tìm kiếm của bạn.'
      colSpan={8}
      children={
        <div>
          <p>Thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc để xem tất cả món ăn.</p>
          <button
            type='button'
            onClick={() => setStrSearch('')}
            className='inline-flex justify-center items-center mt-3 gap-3 text-blue-600 hover:text-blue-400'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
              className='lucide lucide-rotate-ccw'
            >
              <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
              <path d='M3 3v5h5' />
            </svg>
            <span>Đặt lại tìm kiếm</span>
          </button>
        </div>
      }
    ></EmptyRow>
  )
  if (strSearch === '' && handleCountFilter() === 0) {
    renderEmptyRow = (
      <EmptyRow
        title='Không có món ăn nào được hiển thị.'
        colSpan={8}
        children={
          <button
            type='button'
            className='flex items-center gap-3  text-sm rounded-xl text-blue-600 hover:text-blue-400'
          >
            <Plus className='w-5 h-5'></Plus>
            <span className='text-base'>Thêm món ăn mới</span>
          </button>
        }
      ></EmptyRow>
    )
  }
  const handleResetFilter = () => {
    const drawer = document.getElementById('drawer-right-filter-menu')
    drawer?.classList.toggle('translate-x-full')
    setStrSearch('')
    setPublishStatus(undefined)
    setOrder('asc')
    setSelectedOptions([])
    setCategories([])
    setIsSelling(undefined)
    setQuantityStatus(undefined)
    setShowMultipleSelect(false)
  }
  useEffect(() => {
    if (strSearch) {
      queryConfig.name = strSearch
      queryConfig.page = '1'
    }
  }, [queryConfig, strSearch])
  const createCSV = (array: Food[]): string => {
    const keys = Object.keys(array[0]) // Collects Table Headers

    let result = '' // CSV Contents
    result += keys.join(',') // Comma Separates Headers
    result += '\n' // New Row

    array.forEach(function (item) {
      // Goes Through Each Array Object
      keys.forEach(function (key) {
        // Goes Through Each Object value
        result += (item as any)[key] + ',' // Comma Separates Each Key Value in a Row
      })
      result += '\n' // Creates New Row
    })

    return result
  }

  const handleDownloadFoodCSV = () => {
    if (downloadState === 'all') {
      const csv = createCSV(food_all)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', 'food_all.csv')
      a.click()
      a.remove()
    } else {
      const csv = createCSV(foodDataItems?.items)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.setAttribute('href', url)
      a.setAttribute('download', 'food_filter.csv')
      a.click()
      a.remove()
    }
  }
  return (
    <div className=''>
      <Helmet>
        <title>Quản lý món ăn | TTFood-Partner</title>
        <meta name='description' content='Quản lý món ăn | TTFood-Partner'></meta>
      </Helmet>
      {showToast.is_open && <Toast message={showToast.message} type={showToast.type} />}
      {isLoadingShop && <Loading />}
      {!isLoadingShop && (
        <div className='container mx-auto pl-10 pr-5 py-5'>
          <div className='flex flex-col pt-4 pb-7 justify-between rounded-md'>
            <div className='flex flex-col mb-4 gap-5'>
              <NavLink to={partnerPaths.menu} className='flex bg-transparent items-center w-full max-w-[250px]'>
                <MoveLeft className='me-3' />
                <span>Quay lại trang thực đơn</span>
              </NavLink>
              <div className='flex items-center justify-between'>
                <h1 className='inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white'>
                  Quản lý món ăn
                </h1>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={() => setOpenModalDownloadFoodCSV(true)}
                    className='text-white inline-flex items-center gap-1 bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
                  >
                    <Download className='w-5 h-5'></Download>
                    <span>Tải xuống CSV</span>
                  </button>
                </div>
              </div>
            </div>
            <div className='relative overflow-x-auto shadow-md sm:rounded-lg bg-white pb-5'>
              <div className='flex justify-between items-center p-5'>
                <div className='flex items-center'>
                  <div className='relative me-5'>
                    <input
                      placeholder='Tìm kiếm món ăn'
                      type='text'
                      value={strSearch}
                      onChange={handleChangeStrSearch}
                      className='text-sm border px-10 py-2 rounded-xl border-blue-400'
                    />
                    <Search className='w-5 h-5 absolute top-1/2 -translate-y-1/2 left-2 text-blue-400'></Search>
                  </div>
                  <div className='relative'>
                    <button
                      type='button'
                      onClick={() => {
                        const drawer = document.getElementById('drawer-right-filter-menu')
                        drawer?.classList.toggle('translate-x-full')
                      }}
                      className='inline-flex items-center gap-3 border border-blue-400 px-5 py-2 text-sm rounded-xl'
                    >
                      <Filter className='w-5 h-5 text-blue-400'></Filter>
                      <span className='hidden md:block'>Lọc</span>
                    </button>
                    {handleCountFilter() > 0 && (
                      <div className='absolute -top-2 -right-2 rounded-full w-5 h-5 flex justify-center items-center text-xs bg-slate-300'>
                        {handleCountFilter()}
                      </div>
                    )}
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      const drawer = document.getElementById('drawer-right-sort-food')
                      drawer?.classList.toggle('translate-x-full')
                    }}
                    className='inline-flex items-center gap-3 border border-blue-400 px-5 py-2 text-sm rounded-xl ms-3'
                  >
                    {renderSortBy}
                  </button>
                </div>
                <div className='flex items-center gap-3'>
                  <label htmlFor='limit'>Hiển thị </label>
                  <select
                    name='limit'
                    id='limit'
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className='px-3 py-1.5 outline-none border rounded-lg border-blue-400'
                  >
                    <option value='5'>5</option>
                    <option value='10'>10</option>
                    <option value='20'>20</option>
                    <option value='50'>50</option>
                  </select>
                </div>
              </div>
              <table className='w-full table-auto text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                  <tr>
                    <th scope='col' className='p-4'>
                      <div className='flex items-center'>STT</div>
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      THỰC ĐƠN
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      TÊN MÓN ĂN
                    </th>
                    <th scope='col' className='px-6 py-3'>
                      HÌNH ẢNH
                    </th>
                    <th scope='col' className='px-6 py-3 text-center'>
                      GIÁ
                    </th>
                    <th scope='col' className='px-6 py-3 text-center'>
                      DANH MỤC
                    </th>
                    <th scope='col' className='px-6 py-3 text-center'>
                      TRẠNG THÁI
                    </th>
                    <th scope='col' className='px-2 py-3 text-center'></th>
                  </tr>
                </thead>
                {isLoadingFoodData && <LoadingTableFoodSkeleton></LoadingTableFoodSkeleton>}
                {!isLoadingFoodData && (
                  <>
                    {foodDataItems?.items.length === 0 && <>{renderEmptyRow}</>}
                    {foodDataItems?.items.length > 0 && (
                      <>
                        <tbody>
                          {foodDataItems?.items.map((food, index) => (
                            <FoodManageItem setShowToast={setShowToast} key={food._id} index={index} food={food} />
                          ))}
                        </tbody>
                      </>
                    )}
                  </>
                )}
              </table>
              <Pagination path={''} pageSize={foodDataItems?.pagination.total} queryConfig={queryConfig} />
            </div>
          </div>
        </div>
      )}
      {/* Drawer filter food */}
      <div
        id='drawer-right-filter-menu'
        className='fixed top-[63px] right-0 z-[100] h-screen overflow-y-auto transition-transform translate-x-full bg-white w-96 dark:bg-gray-800'
        tabIndex={-1}
        aria-labelledby='drawer-right-label'
      >
        <div className='p-4'>
          <h5
            id='drawer-right-label'
            className='inline-flex items-center text-xl font-semibold text-gray-900 dark:text-gray-400'
          >
            Bộ lọc
          </h5>
          <button
            type='button'
            onClick={() => {
              const drawer = document.getElementById('drawer-right-filter-menu')
              drawer?.classList.toggle('translate-x-full')
            }}
            aria-controls='drawer-right-filter-menu'
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
        <div className='flex h-[400px] flex-col gap-5 md:gap-10 overflow-scroll'>
          <div className=''>
            <div className='font-[530] text-base px-5'>
              Danh mục {showMultipleSelect !== false && categories.length > 0 && <span className='text-sm'>(1)</span>}
            </div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={showMultipleSelect === false}
                  onChange={() => setShowMultipleSelect(false)}
                  id='categories_all'
                  name='categories'
                  type='radio'
                />
                <label htmlFor='categories_all'>Tất cả</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={showMultipleSelect === true}
                  onChange={() => setShowMultipleSelect(true)}
                  id='categories'
                  name='categories'
                  type='radio'
                />
                <label htmlFor='categories'>Chọn danh mục</label>
              </div>
              {showMultipleSelect && <SelectMutipleInput setSelectedOptions={setSelectedOptions}></SelectMutipleInput>}
            </div>
            <hr />
          </div>
          <div className=''>
            <div className='font-[530] text-base px-5'>
              Trạng thái {quantity_status !== undefined && <span className='text-sm'>(1)</span>}
            </div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={quantity_status === undefined}
                  onChange={() => setQuantityStatus(undefined)}
                  id='quantity_status_all'
                  name='quantity_status'
                  type='radio'
                />
                <label htmlFor='quantity_status_all'>Tất cả</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={quantity_status === 'instock'}
                  onChange={() => setQuantityStatus('instock')}
                  id='quantity_status_instock'
                  name='quantity_status'
                  type='radio'
                />
                <label htmlFor='quantity_status_instock'>Còn hàng</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={quantity_status === 'low_stock'}
                  onChange={() => setQuantityStatus('low_stock')}
                  id='quantity_status_low_stock'
                  name='quantity_status'
                  type='radio'
                />
                <label htmlFor='quantity_status_low_stock'>Sắp hết hàng</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={quantity_status === 'out_of_stock'}
                  onChange={() => setQuantityStatus('out_of_stock')}
                  id='quantity_status_out_of_stock'
                  name='quantity_status'
                  type='radio'
                />
                <label htmlFor='quantity_status_out_of_stock'>Hết hàng</label>
              </div>
            </div>
            <hr />
          </div>
          <div className=''>
            <div className='font-[530] text-base px-5'>
              Chế độ hiển thị {publish_status !== undefined && <span className='text-sm'>(1)</span>}
            </div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={publish_status === undefined}
                  onChange={() => setPublishStatus(undefined)}
                  id='publish_status_all'
                  name='publish_status'
                  type='radio'
                />
                <label htmlFor='publish_status_all'>Tất cả</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={publish_status === 'unpublished'}
                  onChange={() => setPublishStatus('unpublished')}
                  id='publish_status_unpublished'
                  name='publish_status'
                  type='radio'
                />
                <label htmlFor='publish_status_unpublished'>Không hiển thị trong cửa hàng trực tuyến</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={publish_status === 'published'}
                  onChange={() => setPublishStatus('published')}
                  id='publish_status_published'
                  name='publish_status'
                  type='radio'
                />
                <label htmlFor='publish_status_published'>Hiển thị trong cửa hàng trực tuyến</label>
              </div>
            </div>
          </div>
          <hr />
          <div className=''>
            <div className='font-[530] text-base px-5'>
              Đăng bán {is_selling !== undefined && <span className='text-sm'>(1)</span>}
            </div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_selling === undefined}
                  onChange={() => setIsSelling(undefined)}
                  id='is_selling_all'
                  name='is_selling'
                  type='radio'
                />
                <label htmlFor='is_selling_all'>Tất cả</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_selling === SellingStatus.APPROVED}
                  onChange={() => setIsSelling(SellingStatus.APPROVED)}
                  id='is_selling_approved'
                  name='is_selling'
                  type='radio'
                />
                <label htmlFor='is_selling_approved'>
                  Đã được đăng bán trên{' '}
                  <span className='font-bold'>
                    TTFo<span className='text-apps-pink'>o</span>d
                  </span>
                </label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_selling === SellingStatus.WAITING}
                  onChange={() => setIsSelling(SellingStatus.WAITING)}
                  id='is_selling_waiting'
                  name='is_selling'
                  type='radio'
                />
                <label htmlFor='is_selling_waiting'>
                  Đang chờ{' '}
                  <span className='font-bold'>
                    TTFo<span className='text-apps-pink'>o</span>d
                  </span>{' '}
                  xác nhận
                </label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_selling === SellingStatus.IN_STORE}
                  onChange={() => setIsSelling(SellingStatus.IN_STORE)}
                  id='is_selling_instore'
                  name='is_selling'
                  type='radio'
                />
                <label htmlFor='is_selling_instore'>
                  Chưa được đăng bán trên{' '}
                  <span className='font-bold'>
                    TTFo<span className='text-apps-pink'>o</span>d
                  </span>
                </label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_selling === SellingStatus.REJECTED}
                  onChange={() => setIsSelling(SellingStatus.REJECTED)}
                  id='is_selling_rejected'
                  name='is_selling'
                  type='radio'
                />
                <label htmlFor='is_selling_rejected'>
                  Bị từ chối bởi{' '}
                  <span className='font-bold'>
                    TTFo<span className='text-apps-pink'>o</span>d
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className='p-5 border-t relative bottom-3 overflow-hidden bg-white'>
          {handleCountFilter() > 0 && (
            <div className='flex justify-between items-center'>
              <div className='font-bold'>Bộ lọc được áp dụng {handleCountFilter()}</div>
              <button type='button' onClick={handleResetFilter} className='text-blue-600 hover:text-blue-400'>
                Xóa bộ lọc
              </button>
            </div>
          )}
          {handleCountFilter() === 0 && <div className='font-bold'>Không có bộ lọc nào được áp dụng </div>}
        </div>
      </div>
      {/* Drawer sort food */}
      <div
        id='drawer-right-sort-food'
        className='fixed top-[63px] right-0 z-[100] h-screen overflow-y-auto transition-transform translate-x-full bg-white w-96 dark:bg-gray-800'
        tabIndex={-1}
        aria-labelledby='drawer-right-label'
      >
        <div className='p-4'>
          <h5
            id='drawer-right-label'
            className='inline-flex items-center text-xl font-semibold text-gray-900 dark:text-gray-400'
          >
            Sắp xếp
          </h5>
          <button
            type='button'
            onClick={() => {
              const drawer = document.getElementById('drawer-right-sort-food')
              drawer?.classList.toggle('translate-x-full')
            }}
            aria-controls='drawer-right-sort-food'
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
        <div className='flex flex-col gap-5 h-[450px] overflow-scroll'>
          <div className=''>
            <div className='font-[530] text-base px-5'>Mới nhất</div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.newest && order === 'asc'}
                  onChange={() => {
                    setSortBy(SORT_BY.newest)
                    setOrder('asc')
                  }}
                  id='sort_by_newest_asc'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_newest_asc'>
                  Tăng <span className='font-bold text-sm'>(mặc định)</span>
                </label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.newest && order === 'desc'}
                  onChange={() => {
                    setSortBy(SORT_BY.newest)
                    setOrder('desc')
                  }}
                  id='sort_by_newest'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_newest'>Giảm</label>
              </div>
            </div>
            <hr />
          </div>
          <div className=''>
            <div className='font-[530] text-base px-5'>Tên món ăn</div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.name && order === 'asc'}
                  onChange={() => {
                    setSortBy(SORT_BY.name)
                    setOrder('asc')
                  }}
                  id='sort_by_name_asc'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_name_asc'>Tăng</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.name && order === 'desc'}
                  onChange={() => {
                    setSortBy(SORT_BY.name)
                    setOrder('desc')
                  }}
                  id='sort_by_name_desc'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_name_desc'>Giảm</label>
              </div>
            </div>
            <hr />
          </div>
          <div className=''>
            <div className='font-[530] text-base px-5'>Giá bán</div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.price && order === 'asc'}
                  onChange={() => {
                    setSortBy(SORT_BY.price)
                    setOrder('asc')
                  }}
                  id='sort_by_price_asc'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_price_asc'>Tăng</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.price && order === 'desc'}
                  onChange={() => {
                    setSortBy(SORT_BY.price)
                    setOrder('desc')
                  }}
                  id='sort_by_price_desc'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_price_desc'>Giảm</label>
              </div>
            </div>
          </div>
          <hr />
          <div className=''>
            <div className='font-[530] text-base px-5'>Bán chạy nhất</div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.sold && order === 'asc'}
                  onChange={() => {
                    setSortBy(SORT_BY.sold)
                    setOrder('asc')
                  }}
                  id='sort_by_sold_asc'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_sold_asc'>Tăng</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={sort_by === SORT_BY.sold && order === 'desc'}
                  onChange={() => {
                    setSortBy(SORT_BY.sold)
                    setOrder('desc')
                  }}
                  id='sort_by_sold_desc'
                  name='sort_by'
                  type='radio'
                />
                <label htmlFor='sort_by_sold_desc'>Giảm</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal dowload food csv */}
      <Modal
        showDialog={openModalDownloadFoodCSV}
        width='max-w-md'
        children={
          <div className='p-5'>
            <div className='flex justify-between items-center'>
              <h4 className='text-lg font-bold'>Bạn muốn xuất mục nào?</h4>
              {/* close button */}
              <button
                type='button'
                onClick={() => setOpenModalDownloadFoodCSV(false)}
                className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center'
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
            <div className='flex flex-col gap-3 mt-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={downloadState === 'all'}
                  value={downloadState}
                  onChange={() => setDownloadState('all')}
                  type='radio'
                  id='food_all'
                  name='food_csv'
                />
                <label htmlFor='food_all'>Tất cả</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={downloadState === 'filter'}
                  value={downloadState}
                  onChange={() => setDownloadState('filter')}
                  type='radio'
                  id='food_filter'
                  name='food_csv'
                />
                <label htmlFor='food_filter'>Đã lọc</label>
              </div>
            </div>
            <div className='mt-5 text-gray-800'>
              Các mục của bạn và tất cả dữ liệu của chúng sẽ được tải về dưới dạng tệp CSV.
            </div>
            <div className='flex justify-end gap-3 mt-5'>
              <button
                className='px-5 py-2 rounded-full border border-blue-400 hover:text-white hover:bg-blue-600'
                type='button'
                onClick={() => setOpenModalDownloadFoodCSV(false)}
              >
                Hủy
              </button>
              <button
                type='button'
                onClick={() => handleDownloadFoodCSV()}
                className='px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-400 text-white'
              >
                Tải xuống
              </button>
            </div>
          </div>
        }
      ></Modal>
    </div>
  )
}
export default FoodManage
