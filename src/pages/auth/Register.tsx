import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthService } from "../../features/auth/services/auth.service";
import { useAuthStore } from "../../features/auth/auth.store";
import Input from "../../components/ui/Input";
import GradientButton from "../../components/ui/GradientButton";

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!phone.trim()) e.phone = "Phone number is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await AuthService.register({ email: email.trim().toLowerCase(), phone: phone.trim(), fullName: name.trim(), password });
      setAuth(res.user, res.token);
      navigate("/home", { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Registration failed";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-page flex flex-col px-4 py-8">
      <div className="w-full max-w-md mx-auto">
<h1 className="text-3xl font-bold text-text-primary mb-1.5">Create Account</h1>
        <p className="text-text-secondary text-base mb-4">Join Quick Send and receive 2 USDT free</p>

        {/* Bonus banner */}
        <div className="flex items-center gap-4 bg-primary-dim rounded-md p-4 border border-primary-border mb-6">
          <span className="text-3xl">🎁</span>
          <div>
            <p className="text-primary text-base font-semibold">Welcome Bonus: 2 USDT</p>
            <p className="text-text-secondary text-xs mt-0.5">Credited after phone verification</p>
          </div>
        </div>

        {apiError ? (
          <div className="mb-4 p-3 bg-danger-dim border border-danger/30 rounded-md text-sm text-danger font-medium">
            {apiError}
          </div>
        ) : null}

        <form onSubmit={handleRegister}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
            error={errors.name}
          />
          <Input
            label="Email Address"
            placeholder="your@email.com"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
            error={errors.email}
          />
          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            type="tel"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: undefined })); }}
            error={errors.phone}
          />
          <Input
            label="Password"
            placeholder="At least 8 characters"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="Repeat your password"
            type="password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((prev) => ({ ...prev, confirm: undefined })); }}
            error={errors.confirm}
          />

          <GradientButton title="Create Account" onPress={() => {}} loading={isLoading} />
        </form>

        <div className="flex justify-center mt-6">
          <p className="text-text-secondary text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
