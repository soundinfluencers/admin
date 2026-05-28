import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/providers/auth-provider/use-auth.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import  { loginFormSchema, type TLoginFormValues } from "@/features/auth-by-email/model/login-form.schema.ts";
import { notifyApiError } from "@/app/api/errors/notify.ts";

export const useLoginForm = () => {
  const { login } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const methods = useForm<TLoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: TLoginFormValues) => {
    console.log("Start login with data:", data);

    try {
      setIsPending(true);

      await login({
        ...data,
        role: "admin",
      });

      console.log("Login successful");
    } catch (error) {
      notifyApiError(error);
    } finally {
      setIsPending(false);
    }
  };

  return {
    methods,
    onSubmit,
    isPending,
  }
};
