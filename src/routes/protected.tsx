import type { RouteObject } from "react-router-dom";
import Home from "../pages/home/Home";
import ProfileSetup from "../pages/onboarding/ProfileSetup";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import WalletHome from "../pages/wallet/WalletHome";
import Deposit from "../pages/wallet/Deposit";
import DepositTracker from "../pages/deposit/DepositTracker";
import Withdraw from "../pages/wallet/Withdraw";
import Transactions from "../pages/wallet/Transactions";
import Beneficiaries from "../pages/beneficiaries/Beneficiaries";
import SendMoney from "../pages/transfers/SendMoney";
import PayoutTracker from "../pages/payout/PayoutTracker";
import WithdrawalTracker from "../pages/withdrawal/WithdrawalTracker";

import ComplianceCenter from "../pages/compliance/ComplianceCenter";
import KYC from "../pages/compliance/KYC";
import NotificationCenter from "../pages/notifications/NotificationCenter";
import Settings from "../pages/settings/Settings";

/**
 * All routes that require authentication.
 * Wrapped in ProtectedRoute guard to redirect unauthenticated users.
 */
export const protectedRoutes: RouteObject[] = [
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding/profile",
    element: (
      <ProtectedRoute>
        <ProfileSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet",
    element: (
      <ProtectedRoute>
        <WalletHome />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet/deposit",
    element: (
      <ProtectedRoute>
        <Deposit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet/withdraw",
    element: (
      <ProtectedRoute>
        <Withdraw />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet/transactions",
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/beneficiaries",
    element: (
      <ProtectedRoute>
        <Beneficiaries />
      </ProtectedRoute>
    ),
  },
  {
    path: "/wallet/transfer",
    element: (
      <ProtectedRoute>
        <SendMoney />
      </ProtectedRoute>
    ),
  },
  {
    path: "/deposit/:id",
    element: (
      <ProtectedRoute>
        <DepositTracker />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payout/:id",
    element: (
      <ProtectedRoute>
        <PayoutTracker />
      </ProtectedRoute>
    ),
  },
  {
    path: "/withdrawal/:id",
    element: (
      <ProtectedRoute>
        <WithdrawalTracker />
      </ProtectedRoute>
    ),
  },

  {
    path: "/compliance",
    element: (
      <ProtectedRoute>
        <ComplianceCenter />
      </ProtectedRoute>
    ),
  },
  {
    path: "/compliance/kyc",
    element: (
      <ProtectedRoute>
        <KYC />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <ProtectedRoute>
        <NotificationCenter />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
];
