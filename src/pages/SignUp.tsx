import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import type { TSignUpResponse } from "@/types";
import { useAuth } from "@/hooks/useAuth";

// Zod schema
const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  /* .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number") */
});

const signUpSchemaWithRefine = signUpSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  }
);

type TSignUpData = z.infer<typeof signUpSchemaWithRefine>;

const SignUp = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TSignUpData>({
    resolver: zodResolver(signUpSchemaWithRefine),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  const onSubmit = async (payload: Partial<TSignUpData>) => {
    setIsLoading(true);
    try {
      delete payload["confirmPassword"];

      const { data } = await axiosInstance.post<TSignUpResponse>(
        "/v1/auth/register",
        payload
      );

      if (data?.success) {
        setErrorMessage("");
        toast.success(data?.message);
        navigate("/login");
      }
      reset();
    } catch (error: any) {
      setErrorMessage(error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-lg">
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Create Account
          </h2>
          <p className="text-slate-400 text-sm mb-8">Join our community</p>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                type="text"
                placeholder="First name"
                {...register("firstName")}
              />
              {errors?.firstName?.message && (
                <p className="text-left text-destructive text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Input
                type="text"
                placeholder="Last name"
                {...register("lastName")}
              />
              {errors?.lastName?.message && (
                <p className="text-left text-destructive text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <Input type="email" placeholder="Email" {...register("email")} />
              {errors?.email?.message && (
                <p className="text-left text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="password"
                className=""
                placeholder="Password"
                {...register("password")}
              />
              {errors?.password?.message && (
                <p className="text-left text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Input
                type="password"
                className=""
                placeholder="Re-type Password"
                {...register("confirmPassword")}
              />
              {errors?.confirmPassword?.message && (
                <p className="text-left text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-left text-destructive text-sm">
                {errorMessage}
              </p>
            )}
            <Button disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Sign up"}
            </Button>
          </form>

          <p className="mt-3">
            Already have an account?{" "}
            <Link to={"/login"} className="text-primary cursor-pointer">
              Login
            </Link>
          </p>

          {/* <div className="mt-6 p-4 bg-slate-800 rounded text-sm text-slate-300">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>Email: demo@example.com</p>
            <p>Password: any password</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
