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

export default function ClassModal({ open = false, hide = () => {}, years = [], teachers = [], _class = null, setClass = () => {}, onSuccess = () => {}}) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const zForm = z.object({
    name: z.string().min(1, "Tên học kỳ không được để trống"),
    academic_year_id: z.number().min(1, "Năm học không được để trống"),
    teacher_id: z.number().min(1, "Giáo viên chủ nhiệm không được để trống"),
  });

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      name: "",
      academic_year_id: 0,
      teacher_id: 0,
    },
  })

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    let r = 'classes.store';
    const rp = [];
    if (_class) {
      r = 'classes.update';
      rp.push(_class.id);
    }
    const func = _class ? httpPut : (url, data, options, doCatch) => httpPost(url, data, options, 'POST', doCatch);
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
    if (_class) {
      form.setValue("name", _class.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue("academic_year_id", _class.year.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      form.setValue("teacher_id", _class.teacher.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } else {
      form.reset();
    }
  }, [_class])
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{_class ? `Sửa lớp học #${_class.id}` : 'Thêm lớp học'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên lớp học</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="academic_year_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm học</FormLabel>
                    <FormControl>
                      <Selector 
                        placeholder="Năm học"
                        defaultValue={field.value}
                        options={years}
                        index="id"
                        label="year"
                        valueObject={false}
                        onChange={(sYear) => {
                          field.onChange((sYear ?? 0) * 1);
                        }}
                        disabled={_class ? true : false}
                        unselectable={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teacher_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giáo viên chủ nhiệm</FormLabel>
                    <FormControl>
                      <Selector 
                        placeholder="Giáo viên"
                        defaultValue={field.value}
                        options={teachers}
                        index="id"
                        label="full_name"
                        valueObject={false}
                        onChange={(sTeacher) => {
                          field.onChange((sTeacher ?? 0) * 1);
                        }}
                        unselectable={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {_class ? "Cập nhật" : "Thêm"}
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