import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Approval from "./pages/Approval";
import Reports from "./pages/Reports";
import Vehicles from "./pages/Vehicles";
import ActivityLog from "./pages/ActivityLog";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/pemesanan"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kendaraan"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Vehicles />
                  </ProtectedRoute>
                }
              />
              <Route path="/approval" element={<Approval />} />
              <Route path="/laporan" element={<Reports />} />
              <Route
                path="/log-aktivitas"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ActivityLog />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
