import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const profileSchema = zod.object({
  firstName: zod.string().min(1, "First name is required").max(100),
  lastName: zod.string().min(1, "Last name is required").max(100),
  dateOfBirth: zod.string().min(1, "Date of birth is required"),
  country: zod.string().min(1, "Country is required"),
  nationality: zod.string().min(1, "Nationality is required"),
});

type ProfileFields = zod.infer<typeof profileSchema>;

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileFields) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // TODO: Wire to real profile setup API
      console.log("Profile setup submitted:", data);
      navigate("/home");
    } catch (err) {
      console.warn("Profile setup failed", err);
      setApiError("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            Complete Your Profile
          </p>
        </div>

        <Card className="shadow-xl shadow-slate-100/50">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Personal Information
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            We need a few details to set up your account and comply with
            financial regulations.
          </p>

          {apiError ? (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 font-medium">
              {apiError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="firstName"
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
              {...register("firstName")}
            />

            <Input
              id="lastName"
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register("lastName")}
            />

            <Input
              id="dateOfBirth"
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register("dateOfBirth")}
            />

            <Input
              id="country"
              label="Country of Residence"
              placeholder="e.g. United States"
              error={errors.country?.message}
              {...register("country")}
            />

            <Input
              id="nationality"
              label="Nationality"
              placeholder="e.g. American"
              error={errors.nationality?.message}
              {...register("nationality")}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="mt-2"
            >
              Complete Setup
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
