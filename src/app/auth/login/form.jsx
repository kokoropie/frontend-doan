"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppContext } from "@/contexts/app-context";
import { httpPost } from "@/lib/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import localforage from "localforage";
import { Eye, EyeClosed, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const zForm = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean().optional(),
})

export default function FormLogin() {
  const router = useRouter();
  const appContext = useContext(AppContext);

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      return httpPost(appContext.getRoute('auth/login'), data)
      .then(res => res.data)
      .then((data) => {
        if (data.status === "success") {
          const dataJson = data.data;

          appContext.setToken(dataJson.token);
          appContext.setRefreshToken(dataJson.refresh_token);
          appContext.setUser(dataJson.user);
          appContext.setRole(dataJson.role);

          toast.success("Đăng nhập thành công");
          router.push("/app");
        } else {
          throw new Error(data.message || "Đăng nhập thất bại");
        }
      });
    }
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localforage.removeItem("user");
    localforage.removeItem("role");
    localforage.removeItem("refreshToken");
    localforage.removeItem("token");
  }, [])

  const onSubmit = (data) => {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Chào mừng trở lại</h1>
            <p className="text-balance text-muted-foreground">
              Đăng nhập vào tài khoản của bạn để tiếp tục sử dụng ứng dụng.
            </p>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? "text" : "password"} placeholder="******" {...field} />
                  </FormControl>
                  <Button
                    variant="link"
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button">
                      {showPassword ? <Eye /> : <EyeClosed />}
                    </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Nhớ phiên đăng nhập</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>Đăng nhập</Button>
        </div>
      </form>
    </Form>
  );
}
