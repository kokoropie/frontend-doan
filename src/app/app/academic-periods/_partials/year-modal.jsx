'use client'

import InputDate from "@/components/form/input-date";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AppContext } from "@/contexts/app-context";
import { httpPost, httpPut } from "@/lib/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@radix-ui/react-dialog";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function YearModal({ open = false, hide = () => {}, year = null, setYear = () => {}, onSuccess = () => {}}) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    from: z.date(),
    to: z.date(),
    move_classes: z.boolean().optional(),
    current_teachers: z.boolean().optional(),
  }).superRefine((data, ctx) => {
    if (data.from > data.to) {
      ctx.addIssue({
        path: ["from", "to"],
        message: "Thời gian không hợp lệ",
        code: z.ZodIssueCode.custom,
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      from: null,
      to: null,
      move_classes: false,
      current_teachers: true,
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    let r = 'academic-years.store';
    const rp = [];
    if (year) {
      r = 'academic-years.update';
      rp.push(year.id);
    }
    data.from = moment(data.from).format("YYYY-MM-DD");
    data.to = moment(data.to).format("YYYY-MM-DD");
    const func = year ? httpPut : (url, data, options, doCatch) => httpPost(url, data, options, 'POST', doCatch);
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
    if (year) {
      form.setValue("from", new Date(year.from), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue("to", new Date(year.to), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else {
      form.reset();
    }
  }, [year])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{year ? "Sửa năm học #" + year.id : "Thêm năm học"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian bắt đầu</FormLabel>
                    <InputDate field={field} disabled={(date) => {
                      return form.getValues("to") && moment(date).hour(0).minute(0).second(0).millisecond(0).isAfter(moment(form.getValues("to")).hour(0).minute(0).second(0).millisecond(0))
                    }} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian kết thúc</FormLabel>
                    <InputDate field={field} disabled={(date) => {
                      return form.getValues("from") && moment(date).hour(0).minute(0).second(0).millisecond(0).isBefore(moment(form.getValues("from")).hour(0).minute(0).second(0).millisecond(0))
                    }} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!year && <FormField
                control={form.control}
                name="move_classes"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Chuyển toàn bộ lớp sang năm học này</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />}
              {!year && form.watch('move_classes') && <FormField
                control={form.control}
                name="current_teachers"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel>Giữ giáo viên chủ nhiệm cũ</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {year ? "Cập nhật" : "Thêm"}
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