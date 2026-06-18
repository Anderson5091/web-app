import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../features/auth/auth.store";
import GradientButton from "../../components/ui/GradientButton";

export default function VerifyPhone() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = searchParams.get("token") || "";
  const phone = searchParams.get("phone");

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!token) navigate("/register", { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      handleVerify(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otp = code || digits.join("");
    if (otp.length !== 6 || !token) return;

    setLoading(true);
    setError("");
    try {
      const res = await authApi.verifyOtp(token, otp);
      setAuth(res.data.user, res.data.token);
      navigate("/home");
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || "Invalid or expired code";
      setError(msg);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!token) return;
    setResending(true);
    setError("");
    try {
      await authApi.sendOtp(token);
      setMessage("New code sent to your phone!");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setError("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleEmailOtp = async () => {
    if (!token) return;
    setEmailSending(true);
    setError("");
    try {
      await authApi.sendOtpEmail(token);
      setMessage("Code sent to your email!");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setError("Failed to send code via email");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-page flex flex-col px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-1.5">Verify Your Phone</h1>
        <p className="text-text-secondary text-base mb-1">
          Enter the 6-digit code sent to {phone ? <span className="text-text-primary font-medium">{phone}</span> : <span className="text-text-primary font-medium">{email}</span>}
        </p>
        <p className="text-text-subtle text-xs mb-6">The code expires in 5 minutes</p>

        {error && (
          <div className="mb-4 p-3 bg-danger-dim border border-danger/30 rounded-md text-sm text-danger font-medium">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-primary-dim border border-primary-border rounded-md text-sm text-primary font-medium">
            {message}
          </div>
        )}

        <div className="flex gap-2 justify-center mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold bg-card border border-border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-text-primary"
            />
          ))}
        </div>

        <GradientButton
          title={loading ? "Verifying..." : "Verify"}
          onPress={() => handleVerify()}
          loading={loading}
          disabled={digits.some((d) => d === "")}
        />

        <div className="flex justify-center mt-6">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend SMS"}
          </button>
        </div>

        <div className="flex justify-center mt-3">
          <button
            onClick={handleEmailOtp}
            disabled={emailSending}
            className="text-text-secondary text-sm hover:text-primary transition-colors disabled:opacity-50"
          >
            {emailSending ? "Sending..." : "Send code via email instead"}
          </button>
        </div>
      </div>
    </div>
  );
}
