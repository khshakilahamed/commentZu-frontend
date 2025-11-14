import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import type { TLoginResponse } from "@/types";

// Zod schema
const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  /* .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number") */
});

type TLoginData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { storeData, isAuthenticated } = useAuth();

  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TLoginData>({
    resolver: zodResolver(loginSchema),
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

  const onSubmit = async (payload: TLoginData) => {
    setIsLogging(true);
    try {
      const { data } = await axiosInstance.post<TLoginResponse>(
        "/v1/auth/login",
        payload
      );

      if (data?.success) {
        const user = data?.data?.userInfo;
        const accessToken = data?.data?.token;

        storeData(user, accessToken);

        setErrorMessage("");
        toast.success(data?.message);
        reset();
        navigate("/");
      }
    } catch (error: any) {
      setErrorMessage(error?.message);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md border rounded-lg">
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-8">
            Sign in to continue the discussion
          </p>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                type="email"
                className=" border"
                placeholder="Email"
                {...register("email")}
              />
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
                //     required
                {...register("password")}
              />
              {errors?.password?.message && (
                <p className="text-left text-destructive text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-left text-destructive text-sm">
                {errorMessage}
              </p>
            )}
            <Button disabled={isLogging} className="w-full">
              {isLogging ? "Logging..." : "Login"}
            </Button>
          </form>

          <p className="mt-3">
            Don't have an account?{" "}
            <Link to={"/register"} className="text-primary cursor-pointer">
              Register
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

export default Login;
