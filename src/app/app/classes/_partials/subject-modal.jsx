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

export default function SubjectModal({ open = false, hide = () => {}, _class = null, semester = null, teachers = [], subjects = [], subject = null, onSuccess = () => {}}) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    teacher: z.number(),
    semester: z.number(),
    subject: z.number(),
  });

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      teacher: 0,
      semester: semester?.id ?? 0,
      subject: 0,
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    let r = 'classes.subjects.store';
    const rp = [_class.id];
    if (subject) {
      r = 'classes.subjects.update';
      rp.push(subject.id);
    }
    const func = subject ? httpPut : httpPost;
    func(appContext.getRoute(r, rp), data)
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
    if (subject) {
      form.setValue("subject", Number(subject?.id ?? 0), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue("teacher", Number(subject?.teacher?.id ?? 0), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else {
      form.reset();
    }
  }, [subject, open])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{subject ? 'Đổi giáo viên' : 'Thêm môn học'}</DialogTitle>
              <DialogDescription>Thông tin môn học lớp <b>{_class?.name}</b>, học kỳ <b>{semester?.name}</b>, năm học <b>{_class?.year?.year}</b></DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Môn học</FormLabel>
                    <FormControl>
                      <Selector
                        placeholder="Môn học"
                        defaultValue={field.value}
                        options={subjects}
                        index="id"
                        label="name"
                        valueObject={false}
                        onChange={(id) => {
                          field.onChange(Number(id))
                        }}
                        disabled={!!subject}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giáo viên dạy</FormLabel>
                    <FormControl>
                      <Selector
                        placeholder="Giáo viên"
                        defaultValue={field.value}
                        options={teachers}
                        index="id"
                        label="full_name"
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
                {subject ? "Đổi" : "Thêm"}
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