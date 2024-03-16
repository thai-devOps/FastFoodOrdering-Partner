import { FC, memo } from 'react'
import { Outlet } from 'react-router-dom'
import MainDash from '~/components/MainDash'
import MainHeader from '~/components/MainHeader'
import Sidebar from '~/components/Sidebar'
interface MainLayoutProps {
  children?: React.ReactNode
}
const MainLayoutInner: FC<MainLayoutProps> = ({ children }: MainLayoutProps) => {
  return (
    <div>
      <MainHeader></MainHeader>
      <Sidebar></Sidebar>
      <MainDash>
        {children}
        <Outlet />
      </MainDash>
    </div>
  )
}
// This layout will not be rerendered when the route changes
const MainLayout = memo(MainLayoutInner)
export default MainLayout
