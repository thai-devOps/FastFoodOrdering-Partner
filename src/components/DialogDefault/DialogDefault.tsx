import React from 'react'

interface DialogDefaultProps {
  showDialog: boolean
  children: React.ReactNode
}

const DialogDefault: React.FC<DialogDefaultProps> = ({ children, showDialog }) => {
  return (
    <>
      {showDialog ? (
        <div>
          <div className='overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 justify-center flex  bg-gray-900/40 backdrop-blur-[5px] z-[1001]  items-center w-full md:inset-0 h-[calc(100%)] max-h-full'>
            <div className='relative animate__animated animate__bounceIn p-4 w-full max-w-md max-h-full'>
              <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
                <div className='p-4 md:p-5 text-center'>
                  <svg
                    className='mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 20 20'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                    />
                  </svg>
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DialogDefault
