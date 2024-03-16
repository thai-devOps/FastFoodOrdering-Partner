import { ArrowDownWideNarrow, ArrowUpWideNarrow, Filter, MoveLeft, Plus, Save, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
import LoadingTableMenuSkeleton from '~/components/LoadingTableMenuSkeleton'
const MenuManage: React.FC = () => {
  const [strSearch, setStrSearch] = useState<string>('')
  const [order, setOrder] = useState<string>('asc')
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    is_open: boolean
  }>({ message: '', type: 'success', is_open: false })
  const [isEditMenu, setIsEditMenu] = useState<boolean>(false)
  const [is_draft, setIsDraft] = useState<string | undefined>(undefined)
  const [is_active, setIsActive] = useState<string | undefined>(undefined)
  const queryConfig = useQueryConfig()
  queryConfig.name = strSearch
  queryConfig.order_by = order
  queryConfig.is_draft = is_draft
  queryConfig.is_active = is_active
  const handleChangeStrSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStrSearch(e.target.value)
  }
  const { data, isLoading: isLoadingMenuData } = useQuery({
    queryKey: ['menusDataPaginated', queryConfig],
    queryFn: () => MENUS_API.getAllMenuByPartnerPagination(queryConfig as MenuListConfig)
  })
  const { data: shopsData, isLoading: isLoadingShop } = useQuery({
    queryKey: ['shopsData'],
    queryFn: () => SHOP_API.getByPartnerId()
  })
  const shop = shopsData?.data.data as Shop
  const menusData = data?.data.data as ListPagination<IMenu>
  const handleCountFilter = () => {
    let count = 0
    if (is_draft !== undefined) {
      count++
    }
    if (is_active !== undefined) {
      count++
    }
    return count
  }
  const handleResetFilter = () => {
    setIsDraft(undefined)
    setIsActive(undefined)
  }
  const methodsFormAddMenu = useForm({
    resolver: yupResolver(menuSchema)
  })
  const {
    handleSubmit: handleSubmitAddNewMenu,
    register: registerAddNewMenu,
    reset: resetAddNewMenu,
    setError: setErrorAddNewMenu,
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
  const onSubmitAddNewMenu = handleSubmitAddNewMenu((data) => {
    if (data._id) {
      const formData: MenuRequestType = {
        _id: data._id,
        name: data.name,
        description: data.description,
        is_draft: data.is_draft,
        is_active: data.is_active,
        shop_id: shop?._id
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
            queryKey: ['menusDataPaginated']
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
        shop_id: shop?._id
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
            queryKey: ['menusDataPaginated']
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
  useEffect(() => {
    setTimeout(async () => {
      await queryClient.invalidateQueries({
        queryKey: ['menusDataPaginated']
      })
    })
  }, [queryClient])
  let renderEmptyRow: React.ReactNode = (
    <EmptyRow
      title='Không có thực đơn nào phù với tìm kiếm của bạn.'
      children={
        <div>
          <p>Thử tìm kiếm bằng từ khóa khác hoặc xóa bộ lọc để xem tất cả thực đơn.</p>
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
        title='Không có thực đơn nào được hiển thị.'
        children={
          <button
            type='button'
            onClick={() => {
              setIsEditMenu(false)
              methodsFormAddMenu.reset()
              methodsFormAddMenu.setValue('_id', '')
              methodsFormAddMenu.setValue('is_draft', false)
              methodsFormAddMenu.setValue('description', '')
              methodsFormAddMenu.setValue('is_active', true)
              methodsFormAddMenu.setValue('name', '')
              const drawer = document.getElementById('drawer-right-add-new-menu')
              drawer?.classList.toggle('translate-x-full')
            }}
            className='flex items-center gap-3  text-sm rounded-xl text-blue-600 hover:text-blue-400'
          >
            <Plus className='w-5 h-5'></Plus>
            <span className='text-base'>Thêm thực đơn mới</span>
          </button>
        }
      ></EmptyRow>
    )
  }
  return (
    <div className=''>
      <Helmet>
        <title>Quản lý thực đơn | TTFood-Partner</title>
        <meta name='description' content='Quản lý thực đơn | TTFood-Partner'></meta>
      </Helmet>
      {showToast.is_open && <Toast message={showToast.message} type={showToast.type} />}
      <div className='container mx-auto pl-10 pr-5 py-5'>
        <div className='flex flex-col pt-4 pb-7 justify-between rounded-md'>
          <div className='flex flex-col mb-4 gap-5'>
            <NavLink to={partnerPaths.menu} className='flex bg-transparent items-center w-full max-w-[250px]'>
              <MoveLeft className='me-3' />
              <span>Quay lại trang thực đơn</span>
            </NavLink>
            <h1 className='inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white'>
              Quản lý thực đơn
            </h1>
          </div>
          <div className='relative overflow-x-auto shadow-md sm:rounded-lg bg-white pb-5'>
            <div className='flex justify-between items-center p-5'>
              <div className='flex items-center'>
                <div className='relative me-5'>
                  <input
                    placeholder='Tìm kiếm thực đơn'
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
                    <span>Lọc</span>
                  </button>
                  {handleCountFilter() > 0 && (
                    <div className='absolute -top-2 -right-2 rounded-full w-5 h-5 flex justify-center items-center text-xs bg-slate-300'>
                      {handleCountFilter()}
                    </div>
                  )}
                </div>
                {order === 'desc' && (
                  <button
                    type='button'
                    onClick={() => setOrder('asc')}
                    className='inline-flex items-center gap-3 border border-blue-400 px-5 py-2 text-sm rounded-xl ms-3'
                  >
                    <ArrowDownWideNarrow className='w-5 h-5 text-blue-400' />
                    <span>Sắp xếp</span>
                  </button>
                )}
                {order === 'asc' && (
                  <button
                    type='button'
                    onClick={() => setOrder('desc')}
                    className='inline-flex items-center gap-3 border border-blue-400 px-5 py-2 text-sm rounded-xl ms-3'
                  >
                    <ArrowUpWideNarrow className='w-5 h-5 text-blue-400' />
                    <span>Sắp xếp</span>
                  </button>
                )}
              </div>
              <div>
                <button
                  type='button'
                  onClick={() => {
                    setIsEditMenu(false)
                    methodsFormAddMenu.reset()
                    methodsFormAddMenu.setValue('_id', '')
                    methodsFormAddMenu.setValue('is_draft', false)
                    methodsFormAddMenu.setValue('description', '')
                    methodsFormAddMenu.setValue('is_active', true)
                    methodsFormAddMenu.setValue('name', '')
                    const drawer = document.getElementById('drawer-right-add-new-menu')
                    drawer?.classList.toggle('translate-x-full')
                  }}
                  className='flex items-center gap-3 border border-blue-400 px-5 py-2 text-sm rounded-xl bg-blue-600 text-white'
                >
                  <Plus className='w-5 h-5'></Plus>
                  <span>Thêm mới</span>
                </button>
              </div>
            </div>
            <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
              <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
                <tr>
                  <th scope='col' className='p-4'>
                    <div className='flex items-center'>STT</div>
                  </th>
                  <th scope='col' className='px-6 py-3'>
                    TÊN THỰC ĐƠN
                  </th>
                  <th scope='col' className='px-6 py-3'>
                    MÔ TẢ
                  </th>
                  <th scope='col' className='px-6 py-3 text-center'>
                    BẢN NHÁP
                  </th>
                  <th scope='col' className='px-6 py-3 text-center'>
                    TRẠNG THÁI
                  </th>
                  <th scope='col' className='px-6 py-3 text-center'>
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              {isLoadingMenuData && <LoadingTableMenuSkeleton></LoadingTableMenuSkeleton>}
              {!isLoadingMenuData && (
                <>
                  {menusData?.items.length === 0 && <>{renderEmptyRow}</>}
                  {menusData?.items.length > 0 && (
                    <>
                      <tbody>
                        {menusData?.items.map((menu, index) => (
                          <MenuItem
                            methodsFormAddMenu={methodsFormAddMenu}
                            setIsEditMenu={setIsEditMenu}
                            key={menu._id}
                            setShowToast={setShowToast}
                            index={index}
                            menu={menu}
                          />
                        ))}
                      </tbody>
                    </>
                  )}
                </>
              )}
            </table>
            <Pagination path={''} pageSize={menusData?.pagination.total} queryConfig={queryConfig} />
          </div>
        </div>
      </div>
      {/* Drawer filter menu */}
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
        <div className='flex flex-col gap-3'>
          <div className=''>
            <div className='font-[530] text-base px-5'>
              Bản nháp {is_draft !== undefined && <span className='text-sm'>(1)</span>}
            </div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_draft === undefined}
                  onChange={() => setIsDraft(undefined)}
                  id='is_draft_all'
                  name='is_draft1'
                  type='radio'
                />
                <label htmlFor='is_draft_all'>Tất cả</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_draft === '1'}
                  onChange={() => setIsDraft('1')}
                  id='is_draft1'
                  name='is_draft1'
                  type='radio'
                />
                <label htmlFor='is_draft1'> Bản nháp</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_draft === '0'}
                  onChange={() => setIsDraft('0')}
                  id='is_draft2'
                  name='is_draft1'
                  type='radio'
                />
                <label htmlFor='is_draft2'>Công khai</label>
              </div>
            </div>
            <hr />
          </div>
          <div className=''>
            <div className='font-[530] text-base px-5'>
              Trạng thái {is_active !== undefined && <span className='text-sm'>(1)</span>}
            </div>
            <div className='flex flex-col gap-3 p-5'>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_active === undefined}
                  onChange={() => setIsActive(undefined)}
                  id='is_active_all'
                  name='is_active'
                  type='radio'
                />
                <label htmlFor='is_active_all'>Tất cả</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_active === '1'}
                  onChange={() => setIsActive('1')}
                  id='is_active'
                  name='is_active'
                  type='radio'
                />
                <label htmlFor='is_active'>Đang sử dụng</label>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  checked={is_active === '0'}
                  onChange={() => setIsActive('0')}
                  id='is_active1'
                  name='is_active'
                  type='radio'
                />
                <label htmlFor='is_active1'>Không được sử dụng</label>
              </div>
            </div>
            <hr />
            <div className='p-5'>
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
        </div>
      </div>
      {/* Drawer add or edit menu */}
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
                  classNameLable='inline-block text-base font-normal tracking-wide text-gray-900 dark:text-white me-3 mb-2'
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
                  <label htmlFor='is_draft' className=' cursor-pointer mb-6'>
                    Đánh dấu là bản nháp
                  </label>
                </div>
                <div className='flex items-center gap-x-3'>
                  <CommonInput
                    id='is_activeMenu'
                    name='is_active'
                    register={registerAddNewMenu}
                    type='checkbox'
                    className='mt-1'
                    classNameInput='cursor-pointer'
                    errorMessage={errorsAddNewMenu.is_active?.message}
                  />
                  <label htmlFor='is_activeMenu' className=' cursor-pointer mb-6'>
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
                      Đang tải...
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
  )
}
export default MenuManage
