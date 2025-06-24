'use client';

import { AppContext } from "@/contexts/app-context";
import { httpGet } from "@/lib/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export default ({ open = false, hide = () => {}, onSuccess = () => {}}) => {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);
  const [initClasses, setInitClasses] = useState(false);
  const [initStudents, setInitStudents] = useState(false);
  const [initTeachers, setInitTeachers] = useState(false);
  const [initParents, setInitParents] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);

  const zForm = z.object({
    title : z.string().min(1, "Tiêu đề không được để trống"),
    message: z.string().min(1, "Nội dung không được để trống"),
    type: z.enum(['all', 'class', 'student', 'teacher', 'parent']),
    class_id: z.number().optional(),
    ids: z.array(z.union([z.number()])).optional()
  }).superRefine((data, ctx) => {
    if (data.type === 'class' && !data.class_id) {
      ctx.addIssue({
        path: ["class_id"],
        message: "Vui lòng chọn lớp học",
        code: z.ZodIssueCode.custom,
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      title: "",
      message: "",
      type: "all",
      class_id: 0,
      ids: [],
    },
  })

  const onClose = (o) => {
    if (!o) {
      hide();
    }
  }

  const type = form.watch('type');

  useEffect(() => {
    form.reset()
  }, [open])

  useEffect(() => {
    if (open) {
      if (type === 'class' && !initClasses) {
        httpGet(appContext.getRoute('classes.index'), {
          params: {
            no_pagination: 1,
            sort_by: 'name',
            sort: 'desc',
          }
        }).then((res) => {
          if (res.status === 200) {
            const { data } = res.data.data;
            setClasses(data);
            setInitClasses(true);
          } else {
            toast.error(res.data.message);
          }
        })
      } else if (type === 'student' && !initStudents) {
        httpGet(appContext.getRoute('users.index'), {
          params: {
            no_relations: 1,
            no_pagination: 1,
            roles: 'student',
            sort_by: ['first_name', 'last_name'],
            sort: ['asc', 'asc'],
          }
        }).then((res) => {
          if (res.status === 200) {
            const { data } = res.data.data;
            setStudents(data);
            setInitStudents(true);
          } else {
            toast.error(res.data.message);
          }
        })
      } else if (type === 'teacher' && !initTeachers) {
        httpGet(appContext.getRoute('users.index'), {
          params: {
            no_relations: 1,
            no_pagination: 1,
            roles: 'teacher',
            sort_by: ['first_name', 'last_name'],
            sort: ['asc', 'asc'],
          }
        }).then((res) => {
          if (res.status === 200) {
            const { data } = res.data.data;
            setTeachers(data);
            setInitTeachers(true);
          } else {
            toast.error(res.data.message);
          }
        })
      } else if (type === 'parent' && !initParents) {
        httpGet(appContext.getRoute('users.index'), {
          params: {
            no_relations: 1,
            no_pagination: 1,
            roles: 'parent',
            sort_by: ['first_name', 'last_name'],
            sort: ['asc', 'asc'],
          }
        }).then((res) => {
          if (res.status === 200) {
            const { data } = res.data.data;
            setParents(data);
            setInitParents(true);
          } else {
            toast.error(res.data.message);
          }
        })
      }
    }
  }, [type]);

  const handleSubmit = (data) => {
    if (submitting) return;
    setSubmitting(true);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Gửi thông báo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start col-span-2">
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>Gửi</Button>
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