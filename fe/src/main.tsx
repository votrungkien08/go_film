import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google';
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="486403883783-qvmud0d26gkq5sbccqs5jd49o5g0n1s4.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <App />
      </StrictMode>
    </QueryClientProvider>
  </GoogleOAuthProvider>
)
