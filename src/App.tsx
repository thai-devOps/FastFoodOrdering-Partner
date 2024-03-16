import React, { useContext, useEffect } from 'react'
import 'animate.css'
import useAppRoute from './useAppRoute'
import { Bounce, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AppContext } from './contexts/app.context'
import { LocalStorageEventTarget } from './utils/auth'
import { HelmetProvider } from 'react-helmet-async'
const App: React.FunctionComponent = () => {
  const routeElements = useAppRoute()
  const { reset } = useContext(AppContext)
  /**avoid memory leaks */
  useEffect(() => {
    LocalStorageEventTarget.addEventListener('clearLS', reset)
    return () => {
      LocalStorageEventTarget.removeEventListener('clearLS', reset)
    }
  }, [reset])
  return (
    <HelmetProvider>
      {routeElements}
      <ToastContainer
        position='top-right'
        theme='colored'
        transition={Bounce}
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      ></ToastContainer>
    </HelmetProvider>
  )
}
export default App
