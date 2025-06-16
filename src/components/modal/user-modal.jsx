'use client'

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { httpPost, httpPut } from "@/lib/http";
import { ucfirst, zArrayValues } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/react-dialog";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Selector from "../form/selector";
import { AppContext } from "@/contexts/app-context";

export default function ({ open = false, hide = () => {}, role = '', user = null, setUser = () => {}, label = '', relationshipLabel = {}, relationship = {}, relationshipData = {}, relationshipValues = {}, onSuccess = () => {}}) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    last_name : z.string().min(1, "Họ không được để trống"),
    first_name: z.string().min(1, "Tên không được để trống"),
    email: z.string().email("Email không hợp lệ").min(1, "Email không được để trống"),
    random_password: z.boolean().default(false),
    password: z.string(),
    role: z.enum([role]),
		relationship: z.array(z.string()).optional(),
		relationship_data: z.array(z.union([
      z.array(z.union(zArrayValues())),
      ...zArrayValues(),
    ])).optional()
  }).superRefine((data, ctx) => {
    if (!data.random_password && (!data.password || data.password.trim() === "")) {
      ctx.addIssue({
        path: ["password"],
        message: "Vui lòng nhập mật khẩu hoặc chọn tạo mật khẩu ngẫu nhiên",
        code: z.ZodIssueCode.custom,
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      last_name: "",
      first_name: "",
      email: "",
      password: "",
      random_password: true,
      role: role,
			relationship: Object.keys(relationship),
			relationship_data: [],
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    let r = 'users.store';
    const rp = [];
    if (user) {
      r = 'users.update';
      rp.push(user.id);
    }
    const func = user ? httpPut : (url, data, options, doCatch) => httpPost(url, data, options, 'POST', doCatch);
    func(appContext.getRoute(r, rp), data, {}, false)
    .then(res => res.data)
    .then((data) => {
      if (data.status === "success") {
        toast.success(data.message);
        onSuccess(data.data);
      } else {
        throw new Error(data.message || "Xảy ra lỗi");
      }
    }).catch((error) => {
      const response = error.response;
      if (response) {
        const data = response.data;
        if (data.errors) {
          Object.keys(data.errors).forEach((key) => {
            form.setError(key, {
              type: "server",
              message: data.errors[key][0],
            });
          });
        } else if (data.message) {
          toast.error(data.message);
        } else {
          toast.error("Có lỗi xảy ra trong quá trình kết nối đến máy chủ. Vui lòng thử lại sau.");
        }
      } else {
        toast.error("Có lỗi xảy ra trong quá trình kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
    }).finally(() => {
      setSubmitting(false);
    })
  }

  const onClose = (o) => {
    if (!o) {
      form.reset();
      hide();
    } 
  }

  useEffect(() => {
    if (user) {
      form.setValue("last_name", user.last_name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue("first_name", user.first_name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue("email", user.email, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      if (relationship) {
        form.setValue("relationship_data", relationshipValues, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    } else {
      form.reset();
    }
  }, [user])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{user ? `${ucfirst(label)} ${user.full_name} #${user.id}` : `Thêm ${label}`}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-2">
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!user && <><FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} autoComplete="off" disabled={form.watch("random_password")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="random_password"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start col-span-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mật khẩu ngẫu nhiên</FormLabel>
                    </div>
										<FormMessage />
                  </FormItem>
                )}
              /></>}
							{relationship && Object.entries(relationship).map(([key, labelField], index) => (
								<FormField
									key={key}
									control={form.control}
									name={`relationship_data.${index}`}
									render={({ field }) => (
										<FormItem className="col-span-2">
											<FormLabel>{ucfirst(relationshipLabel?.[key] ?? key)}</FormLabel>
											<FormControl>
												<Selector
													placeholder={ucfirst(relationshipLabel?.[key] ?? key)}
													defaultValue={field.value}
													options={relationshipData?.[key] ?? []}
													index="id"
													label={labelField}
													valueObject={false}
													onChange={(ids) => {
                            if (Array.isArray(ids)) {
                              field.onChange(ids.map((id) => Number(id)));
                            } else {
                              field.onChange(Number(ids));
                            }
													}}
													multiple={key !== 'classes'}
													closeOnSelected={key == 'classes'}
                          unselectable={key !== 'classes'}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {user ? "Cập nhật" : "Thêm"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" disabled={submitting}>
                  Hủy
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}