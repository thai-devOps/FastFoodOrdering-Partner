import { FC, memo } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '~/components/Footer'
import HeaderRegisterLayout from '~/components/HeaderRegisterLayout'

interface RegisterLayoutProps {
  children?: React.ReactNode
}
const RegisterLayoutInner: FC<RegisterLayoutProps> = ({ children }: RegisterLayoutProps) => {
  return (
    <div className='bg-[url(images/main-banner.jpg)] bg-no-repeat bg-cover bg-center'>
      <HeaderRegisterLayout />
      <div>
        {children}
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
// This layout will not be rerendered when the route changes
const RegisterLayout = memo(RegisterLayoutInner)
export default RegisterLayout
