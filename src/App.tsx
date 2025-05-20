
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import PriceAuditLogPage from "./pages/PriceAuditLogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductProvider } from "./contexts/ProductContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import UserManagementPage from "./pages/UserManagementPage";
import AdminPage from "./pages/AdminPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PermissionsProvider>
          <ProductProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/products" element={
                  <ProtectedRoute>
                    <ProductsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/price-audit-log" element={
                  <ProtectedRoute>
                    <PriceAuditLogPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/products/:id" element={
                  <ProtectedRoute>
                    <ProductDetailPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/user-management" element={
                  <AdminRoute>
                    <UserManagementPage />
                  </AdminRoute>
                } />
                
                <Route path="/account-settings" element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ProductProvider>
        </PermissionsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
