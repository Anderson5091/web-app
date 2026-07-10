import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Welcome from "../pages/welcome/Welcome";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyPhone from "../pages/auth/VerifyPhone";
import MFA from "../pages/auth/MFA";
import Privacy from "../pages/privacy/Privacy";
import PublicRoute from "../components/guards/PublicRoute";
import AuthLayout from "../components/layout/AuthLayout";
import { protectedRoutes } from "./protected";
import SessionExpiredModal from "../components/SessionExpiredModal";

function RootLayout() {
  return (
    <>
      <Outlet />
      <SessionExpiredModal />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: (
          <PublicRoute>
            <Welcome />
          </PublicRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        ),
      },
      {
        path: "/verify-phone",
        element: (
          <PublicRoute>
            <VerifyPhone />
          </PublicRoute>
        ),
      },
      {
        path: "/mfa",
        element: <AuthLayout><MFA /></AuthLayout>,
      },
      { path: "/privacy", element: <Privacy /> },
      ...protectedRoutes,
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
