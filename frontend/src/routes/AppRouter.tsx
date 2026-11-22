import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StatusPage } from '@/components/common/StatusPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProfilePage } from '@/pages/account/ProfilePage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage'
import { OwnerDashboardPage } from '@/pages/owner/OwnerDashboardPage'
import { HomePage } from '@/pages/public/HomePage'
import { GuestOnly, RequireAuth } from '@/routes/guards'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<RequireAuth roles={['customer']} />}>
            <Route path="/dashboard" element={<CustomerDashboardPage />} />
          </Route>

          <Route element={<RequireAuth roles={['owner']} />}>
            <Route path="/owner" element={<OwnerDashboardPage />} />
          </Route>

          <Route element={<RequireAuth roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          <Route
            path="*"
            element={
              <StatusPage
                code="404"
                title="Halaman tidak ditemukan"
                description="Tautan yang Anda buka tidak tersedia atau telah dipindahkan."
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
