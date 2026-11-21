import { setUnauthorizedHandler } from '@/lib/axios'
import { AdminHomePage } from '@/pages/admin/AdminHomePage'
import { AccountPage } from '@/pages/auth/AccountPage'
import { ForbiddenPage } from '@/pages/auth/ForbiddenPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { CustomerHomePage } from '@/pages/customer/CustomerHomePage'
import { OwnerHomePage } from '@/pages/owner/OwnerHomePage'
import { HomePage } from '@/pages/public/HomePage'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import { GuestOnly, RequireAuth, RequireRole } from '@/routes/guards'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'

function AuthEvents() {
  const navigate = useNavigate()

  useEffect(() => {
    setUnauthorizedHandler(() => {
      navigate('/login', { replace: true })
    })
  }, [navigate])

  return null
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthEvents />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />
        <Route
          path="/customer"
          element={
            <RequireAuth>
              <RequireRole role="customer">
                <CustomerHomePage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/owner"
          element={
            <RequireAuth>
              <RequireRole role="owner">
                <OwnerHomePage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireRole role="admin">
                <AdminHomePage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
