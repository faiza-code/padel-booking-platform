import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import BookingPage from "./pages/customer/BookingPage";
import { PaymentSuccessPage, PaymentCancelPage } from "./pages/customer/PaymentResultPage";

import LoginPage from "./pages/admin/LoginPage";
import DashboardLayout from "./pages/admin/DashboardLayout";
import CourtsPage from "./pages/admin/CourtsPage";
import ClosuresPage from "./pages/admin/ClosuresPage";
import BookingsPage from "./pages/admin/BookingsPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* واجهة العميل */}
          <Route path="/" element={<BookingPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

          {/* لوحة التحكم */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="courts" replace />} />
            <Route path="courts" element={<CourtsPage />} />
            <Route path="closures" element={<ClosuresPage />} />
            <Route path="bookings" element={<BookingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
