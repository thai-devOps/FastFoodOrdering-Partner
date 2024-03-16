import React from 'react'

interface ModalProps {
  showDialog: boolean
  children: React.ReactNode
  width?: string
}

const Modal: React.FC<ModalProps> = ({ children, showDialog, width = 'max-w-md' }) => {
  return (
    <>
      {showDialog ? (
        <div>
          <div className='overflow-x-hidden fixed top-0 right-0 left-0 justify-center flex  bg-gray-900/40 z-[1001]  items-center w-full md:inset-0 h-[calc(100%)] max-h-full'>
            <div className={`relative animate__animated animate__bounceIn w-full ${width}  max-h-full`}>
              <div className='relative bg-white rounded-lg shadow dark:bg-gray-700'>
                <div>{children}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Modal
