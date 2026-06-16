import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../../utils/token";
import AuthLayout from "../layout/AuthLayout";

export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
}
