import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthService } from "../../features/auth/services/auth.service";
import { authApi } from "../../api/auth.api";
import Input from "../../components/ui/Input";
import GradientButton from "../../components/ui/GradientButton";
import { emailSchema, nameSchema, phoneSchema } from "../../utils/validation";

const registerFormSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type EmailStatus = "idle" | "checking" | "valid" | "invalid" | "taken";

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const checkEmail = useCallback(async (value: string): Promise<boolean> => {
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) {
      setEmailStatus("invalid");
      return false;
    }
    setEmailStatus("checking");
    try {
      const res = await authApi.checkEmail(value);
      const available = res.data.available;
      setEmailStatus(available ? "valid" : "taken");
      return available;
    } catch {
      setEmailStatus("idle");
      return false;
    }
  }, []);

  const getEmailError = () => {
    switch (emailStatus) {
      case "invalid":
        return "Please enter a valid email address";
      case "taken":
        return "This email is already registered";
      default:
        return errors.email;
    }
  };

  const isEmailValid = emailStatus === "valid";
  const showEmailCheck = emailStatus === "valid" || emailStatus === "checking";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const result = registerFormSchema.safeParse({
      fullName: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      confirm,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const emailOk = await checkEmail(email.trim().toLowerCase());
    if (!emailOk) return;

    setIsLoading(true);
    try {
      const res = await AuthService.register({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        fullName: name.trim(),
        password,
      });
      navigate(
        `/verify-phone?userId=${encodeURIComponent(res.userId)}&phone=${encodeURIComponent(res.phone || "")}`,
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-page flex flex-col px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-1.5">
          Create Account
        </h1>
        <p className="text-text-secondary text-base mb-6">
          Join Quick Send and start sending money globally
        </p>

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
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
          />
          <Input
            label="Email Address"
            placeholder="your@email.com"
            type="email"
            value={email}
            valid={isEmailValid}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailStatus("idle");
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            onBlur={() => {
              if (email.trim()) checkEmail(email.trim().toLowerCase());
            }}
            error={getEmailError()}
          />
          {showEmailCheck && !getEmailError() && (
            <p className="text-xs text-text-secondary -mt-3 mb-4">
              {emailStatus === "checking" ? "Checking..." : "Email is available"}
            </p>
          )}
          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            error={errors.phone}
          />
          <Input
            label="Password"
            placeholder="At least 8 characters"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            placeholder="Repeat your password"
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((prev) => ({ ...prev, confirm: undefined }));
            }}
            error={errors.confirm}
          />

          <GradientButton
            title="Create Account"
            onPress={() => {}}
            loading={isLoading}
          />
        </form>

        <div className="flex justify-center mt-6">
          <p className="text-text-secondary text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
