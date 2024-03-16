import React from 'react'
interface MainDashProp {
  children: React.ReactNode
}
// #16191F
const MainDashInner: React.FC<MainDashProp> = ({ children }) => {
  return <main className='md:ml-60 min-h-[100vh] h-auto mt-[62px] bg-[#F6F8FA]'>{children}</main>
}
const MainDash = React.memo(MainDashInner)
export default MainDash
