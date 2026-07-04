import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/auth.store";

export default function SessionExpiredModal() {
  const navigate = useNavigate();
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const logout = useAuthStore((s) => s.logout);

  const handleSignInAgain = () => {
    logout();
    navigate("/login");
  };

  if (!sessionExpired) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl z-10">
        <h3 className="text-lg font-bold text-text-primary mb-2">Session Expired</h3>
        <p className="text-text-secondary text-sm mb-6">
          Your session has expired due to inactivity. Please sign in again to continue.
        </p>
        <button
          onClick={handleSignInAgain}
          className="w-full flex items-center justify-center px-6 py-3.5 rounded-lg font-bold text-sm tracking-wide bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white hover:opacity-90 transition-all duration-200"
        >
          Sign In Again
        </button>
      </div>
    </div>
  );
}