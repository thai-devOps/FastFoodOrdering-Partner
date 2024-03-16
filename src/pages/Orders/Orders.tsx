import { FC } from 'react'
import { Helmet } from 'react-helmet-async'
const Orders: FC = () => {
  return (
    <div>
      <Helmet>
        <title>Đơn đặt hàng | TTFood-Partner</title>
        <meta name='description' content='Quản lý đơn hàng'></meta>
      </Helmet>
      <div className='container mx-auto pl-10 pr-5 py-5'>
        <div className='flex flex-col pt-4 pb-7 justify-between rounded-md'>
          <div className='flex justify-between mb-4'>
            <h1 className='inline-block text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white'>
              Đơn hàng
            </h1>
            <div className='flex items-center gap-3'></div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Orders
