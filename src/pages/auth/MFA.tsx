import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuthStore } from "../../features/auth/auth.store";

const mfaSchema = zod.object({
  code: zod
    .string()
    .length(6, "MFA code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only digits"),
});

type MfaFields = zod.infer<typeof mfaSchema>;

export default function MFA() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaFields>({
    resolver: zodResolver(mfaSchema),
  });

  const onSubmit = async (data: MfaFields) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // TODO: Wire to real MFA verification API in production
      console.log("MFA verification code submitted:", data.code);
      // Simulate successful verification
      navigate("/home");
    } catch (err) {
      console.warn("MFA verification failed", err);
      setApiError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    // TODO: Wire to real resend OTP API
    console.log("Resending MFA code...");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-500/30 mb-3">
            Q
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            QuickSend
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Two-Factor Authentication
          </p>
        </div>

        <Card className="shadow-xl shadow-slate-100/50">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Verify Your Identity
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            We've sent a 6-digit code to{" "}
            <span className="font-semibold text-slate-700">
              {user?.email || "your email"}
            </span>
            . Enter it below to continue.
          </p>

          {apiError ? (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 font-medium">
              {apiError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="mfa-code"
              label="Verification Code"
              placeholder="000000"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              error={errors.code?.message}
              {...register("code")}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="mt-2"
            >
              Verify
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Didn't receive a code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Resend Code
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
