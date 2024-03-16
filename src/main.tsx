import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { QueryClient } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AppContextProvider } from './contexts/app.context.tsx'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContextProvider>
          <App />
        </AppContextProvider>
        <ReactQueryDevtools initialIsOpen={false}></ReactQueryDevtools>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
