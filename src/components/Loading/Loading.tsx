import { FC } from 'react'
import './Loading.css'
interface ILoadingProps {
  color?: string
  classNameCustom?: string
}
// Define props interface used
const Loading: FC<ILoadingProps> = ({
  color,
  classNameCustom = 'w-full h-full min-h-[100vh] overflow-hidden bg-gray-300/50 flex flex-col items-center justify-center fixed z-[10] bg-opacity-50 transition-all duration-300 ease-in-out flex-1/2 left-0 right-0 bottom-0 mx-auto'
}) => {
  return (
    <div className={classNameCustom}>
      <div className='h-[100%] min-h-[100vh] grid place-items-center'>
        <div className={`loader ${color ? color : 'text-apps-black'}`}></div>
        {/* <h2 className='text-center text-white text-xl font-semibold mt-10'>Đang tải...</h2> */}
      </div>
    </div>
  )
}
export default Loading
