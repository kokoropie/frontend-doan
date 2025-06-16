'use client'

import InputDate from "@/components/form/input-date";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppContext } from "@/contexts/app-context";
import { httpPost, httpPut } from "@/lib/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/react-dialog";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function SemesterModal({ open = false, hide = () => {}, year = null, setYear = () => {}, semester = null, setSemester = () => {}, onSuccess = () => {}}) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    name: z.string(),
  });

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      name: ''
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    let r = 'academic-years.semesters.store';
    const rp = [year.id];
    if (semester) {
      r = 'academic-years.semesters.update';
      rp.push(semester.id);
    }
    const func = semester ? httpPut : (url, data, options, doCatch) => httpPost(url, data, options, 'POST', doCatch);
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
    if (semester) {
      form.setValue("name", semester.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else {
      form.reset();
    }
  }, [semester])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{semester ? "Sửa học kỳ #" + semester.id : "Thêm học kỳ"}</DialogTitle>
              <DialogDescription>Nhập thông tin học kỳ của năm học <strong>{year?.year}</strong>.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên học kỳ</FormLabel>
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
                {semester ? "Cập nhật" : "Thêm"}
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