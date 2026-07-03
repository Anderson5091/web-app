import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/auth.store";
import bg from "../../assets/bg.png";

export default function Welcome() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      navigate("/home", { replace: true });
    }
  }, [user, navigate]);

  const stats = [
    { val: "150+", label: "Countries" },
    { val: "< 1%", label: "Fee" },
    { val: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-app-page relative overflow-hidden flex flex-col">
      {/* Background image with gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bg}), linear-gradient(180deg, transparent 0%, rgba(9,12,18,0.7) 50%, #090C12 100%)`,
        }}
      />

      {/* Top Badge */}
      <div className="relative z-10 flex justify-center px-6 pt-0 pb-8">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-dim border border-primary-border">
          <span className="text-primary text-xs font-semibold">⚡ Powered by USDT</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 flex-1 flex flex-col px-6 pb-12">
        <h1 className="text-4xl font-extrabold text-text-primary leading-tight mb-4">
          Send Money<br />Globally. Instantly.
        </h1>
        <p className="text-text-secondary text-base leading-relaxed mb-8">
          Transfer USDT worldwide with low fees, real-time tracking, and bank-grade security.
        </p>

        {/* Stats */}
        <div className="flex justify-around bg-card/80 rounded-xl p-4 border border-border mb-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-primary text-2xl font-bold">{s.val}</p>
              <p className="text-text-subtle text-2xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex-1 flex flex-col px-6 pb-4">
        {/* Get Started */}
        <button
          onClick={() => navigate("/register")}
          className="w-full h-[58px] bg-gradient-to-r from-[#00D6A3] to-[#0084FF] rounded-lg flex items-center justify-center text-white text-base font-bold tracking-wide mb-4 hover:opacity-90 active:opacity-80 transition-all"
        >
          Get Started — It's Free
        </button>

        {/* Sign In */}
        <button
          onClick={() => navigate("/login")}
          className="w-full h-[52px] rounded-lg border border-white/20 flex items-center justify-center text-text-primary text-base font-semibold mb-6 hover:border-white/30 transition-colors"
        >
          Sign In to Your Account
        </button>
      </div>
    </div>
  );
}
