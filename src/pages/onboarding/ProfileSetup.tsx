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
    <div className="min-h-screen bg-app-bg flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-r from-[#00D6A3] to-[#0084FF] text-white font-bold text-2xl shadow-lg shadow-[#00D6A3]/20 mb-3">
            Q
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
            QuickSend
          </h1>
          <p className="mt-2 text-text-secondary font-medium">
            Complete Your Profile
          </p>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Personal Information
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            We need a few details to set up your account and comply with
            financial regulations.
          </p>

          {apiError ? (
            <div className="mb-4 p-3 bg-danger-dim border border-danger/25 rounded-xl text-sm text-danger font-medium">
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
