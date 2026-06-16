import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../features/auth/auth.store";
import { AuthService } from "../../features/auth/services/auth.service";
import Input from "../../components/ui/Input";
import GradientButton from "../../components/ui/GradientButton";

export default function Login() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const verified = searchParams.get("verified") === "true";

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await AuthService.login({ email: email.trim().toLowerCase(), password });
      setAuth(res.user, res.token);
      navigate("/home");
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Login failed";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-app-page px-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-1.5">Welcome Back</h1>
        <p className="text-text-secondary text-base mb-6">Sign in to continue sending money</p>

        {verified ? (
          <div className="mb-4 p-3 bg-primary-dim border border-primary-border rounded-md text-sm text-primary font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            Phone verified! Your account is ready. Sign in to continue.
          </div>
        ) : null}

        {apiError ? (
          <div className="mb-4 p-3 bg-danger-dim border border-danger/30 rounded-md text-sm text-danger font-medium">
            {apiError}
          </div>
        ) : null}

        <form onSubmit={handleLogin}>
          <Input
            label="Email Address"
            placeholder="your@email.com"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="Your password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
            error={errors.password}
          />

          <GradientButton title="Sign In" onPress={() => {}} loading={isLoading} />
        </form>

        <div className="flex justify-center mt-6">
          <p className="text-text-secondary text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
