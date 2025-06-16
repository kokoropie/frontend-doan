'use client'

import InputDate from "@/components/form/input-date";
import Selector from "@/components/form/selector";
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

export default function CopySubjectModal({ open = false, hide = () => {}, _class = null, semester = null, onSuccess = () => {}}) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    from: z.number(),
    to: z.number().min(1, "Học kỳ không được để trống"),
  }).superRefine((data, ctx) => {
    if (data.from == data.to) {
      ctx.addIssue({
        path: ["to"],
        message: "Cần chọn học kỳ sao chép khác nhau",
        code: z.ZodIssueCode.custom,
      });
    }
  })

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      from: semester?.id ?? 0,
      to: 0,
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    httpPost(appContext.getRoute('classes.subjects.copy', [_class.id]), data)
    .then(res => res.data)
    .then((data) => {
      if (data.status === "success") {
        toast.success(data.message);
        onSuccess(data.data);
      } else {
        throw new Error(data.message || "Xảy ra lỗi");
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
    form.setValue('from', semester?.id ?? 0);
    form.reset();
  }, [semester, open])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Sao chép học kỳ</DialogTitle>
              <DialogDescription>
                Sao chép môn học từ học kỳ <b>{semester?.name}</b>, năm học <b>{_class?.year?.year}</b>
                <br />
                <span className="text-red-500">Lưu ý: việc sao chép học kỳ sẽ ghi đè lên các thông tin đã có sẵn ở học kỳ được sao chép.</span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học kỳ</FormLabel>
                    <FormControl>
                      <Selector
                        placeholder="Học kỳ"
                        defaultValue={field.value}
                        options={_class?.semesters.filter((item) => item.id != semester?.id) ?? []}
                        index="id"
                        label="name"
                        valueObject={false}
                        onChange={(id) => {
                          field.onChange(Number(id))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                Sao chép
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