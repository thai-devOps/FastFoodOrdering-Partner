import { FC, HTMLInputTypeAttribute } from 'react'
import { RegisterOptions, UseFormRegister } from 'react-hook-form'
import classNames from 'classnames'
import { useState } from 'react'
interface CustomInputProps {
  cstype?: HTMLInputTypeAttribute
  cslabel?: string
  csplaceholder?: string
  csregisterfunc: UseFormRegister<any>
  csclassname?: string
  csname: string
  icon?: React.ReactNode
  cserrormessage?: string
  csautocomplete?: string
  csdisable?: boolean
  csruleform?: RegisterOptions | undefined
  csrequiredinput?: boolean
}
const CustomInput: FC<CustomInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const handleTogleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  return (
    <div
      className={classNames({
        'mb-2': props.cserrormessage,
        '': !props.cserrormessage
      })}
    >
      <div
        className={`mb-3 ${props.csclassname as string} ${
          props.cserrormessage ? 'border-b-red-500' : 'border-b-white'
        } relative border-b-2 `}
      >
        <div className='flex items-center'>
          {/* <label
            htmlFor={props.csname}
            className='absolute text-[1em] top-1/2 left-1 text-white transform -translate-y-1/2'
          >
            {props.cslabel}
          </label> */}
          <div className='text-white mr-2'>{props.icon}</div>
          <input
            type={props.cstype === 'password' ? (showPassword ? 'text' : 'password') : props.cstype}
            disabled={props.csdisable}
            id={props.csname}
            autoComplete={props.csautocomplete ? props.csautocomplete : 'off'}
            {...props.csregisterfunc(props.csname, props.csruleform)}
            className={classNames({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              'w-full bg-transparent animate__animated animate__headShake py-2.5 px-1 text-sm md:text-base text-red-500 placeholder:text-white focus:border-red-500 focus:ring-red-500':
                props.cserrormessage,
              'w-full border-none placeholder:text-white outline-none bg-transparent shadow-sm py-2.5 px-1 text-sm md:text-base font-medium text-white':
                !props.cserrormessage,
              'cursor-not-allowed bg-gray-200': props.csdisable
            })}
            placeholder={props.csplaceholder}
          />
          {props.cstype === 'password' && (
            <>
              {showPassword ? (
                <div className='cursor-pointer text-white' onClick={handleTogleShowPassword}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-6 h-6'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
                    />
                  </svg>
                </div>
              ) : (
                <div onClick={handleTogleShowPassword} className='text-white cursor-pointer'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-6 h-6'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z'
                    />
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                  </svg>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {Boolean(props.cserrormessage) && (
        <span className='text-red-500 text-sm py-2 font-normal'>{props.cserrormessage}</span>
      )}
    </div>
  )
}
export default CustomInput
