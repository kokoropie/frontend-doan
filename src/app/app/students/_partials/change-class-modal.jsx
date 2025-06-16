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

export default function ChangeClassModal({ open = false, hide = () => {}, user = null, classes = null, onSuccess = () => {}}) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    'class': z.number().min(1, "Vui lòng chọn lớp học"),
  })

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      'class': 0,
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    httpPost(appContext.getRoute('users.change-class', [user.id]), data)
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
    form.reset();
  }, [open])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Chuyển lớp</DialogTitle>
              <DialogDescription>
                Chuyển lớp học sinh <b>{user?.full_name}</b> {user?.current_class && <>từ <b>{user?.current_class?.name}</b></>}
                <br />
                <span className="text-red-500">Lưu ý: chuyển lớp sẽ chuyển thông tin điểm theo các môn tương ứng sang lớp mới. Môn không thuộc lớp mới sẽ không được chuyển điểm.</span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lớp</FormLabel>
                    <FormControl>
                      <Selector
                        placeholder="Lớp"
                        defaultValue={field.value}
                        options={classes.filter((item) => item.id != user?.current_class?.id) ?? []}
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
                Đổi lớp
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