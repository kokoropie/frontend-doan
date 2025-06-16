'use client'

import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { httpPost, httpPut } from "@/lib/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function SubjectModal({ open = false, hide = () => {}, subject = null, setSubject = () => {}, onSuccess = () => {}}) {
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    name: z.string().min(1, "Tên môn học không được để trống"),
  });

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      name: "",
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    let url = `subjects`;
    if (subject) {
      url += `/${subject.id}`;
    }
    const func = subject ? httpPut : (url, data, options, doCatch) => httpPost(url, data, options, 'POST', doCatch);
    func(url, data, {}, false)
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
    if (subject) {
      form.setValue("name", subject.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else {
      form.reset();
    }
  }, [subject])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{subject ? `Sửa môn học #${subject.id}` : 'Thêm môn học'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên môn học</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {subject ? "Cập nhật" : "Thêm"}
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