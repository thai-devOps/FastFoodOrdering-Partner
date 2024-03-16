import classNames from 'classnames'
import { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { partnerPaths } from '~/routes/partnerRoute'
const HeaderRegisterLayout: FC = () => {
  return (
    <nav className='w-full dark:border-gray-600 bg-white'>
      <div className='max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4'>
        <NavLink to={'/'} className='flex items-center text-apps-black space-x-3 rtl:space-x-reverse'>
          <img src='images/vegetable.png' className='h-8' alt='Flowbite Logo' />
          <span className='self-center text-2xl font-semibold whitespace-nowrap dark:text-white'>
            TTFo<span className='text-apps-pink'>o</span>d
          </span>
        </NavLink>
        <div className='flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse'>
          <div className='flex items-center space-x-3 md:inline-flex rtl:space-x-reverse'>
            <NavLink
              to={partnerPaths.login}
              className={({ isActive }) =>
                classNames({
                  'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 hover:text-white font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800':
                    isActive,
                  'text-black border border-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center':
                    !isActive
                })
              }
            >
              Đăng nhập
            </NavLink>
            <NavLink
              to={partnerPaths.register}
              className={({ isActive }) =>
                classNames({
                  'text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 hover:text-white font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800':
                    isActive,
                  'text-black border border-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center':
                    !isActive
                })
              }
            >
              Đăng ký
            </NavLink>
          </div>
          <button
            data-collapse-toggle='navbar-sticky'
            type='button'
            className='inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
            aria-controls='navbar-sticky'
            aria-expanded='false'
          >
            <span className='sr-only'>Open main menu</span>
            <svg
              className='w-5 h-5'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 17 14'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M1 1h15M1 7h15M1 13h15'
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
export default HeaderRegisterLayout
