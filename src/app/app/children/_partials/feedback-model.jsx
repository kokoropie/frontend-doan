'use client';

import Selector from "@/components/form/selector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AppContext } from "@/contexts/app-context";
import { httpPost } from "@/lib/http";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default ({ open = false, hide = () => {}, score = null, onSuccess = () => {}}) => {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);
  const typeScores = [{
    'type': 'other',
    'name': 'Khác',
    'max': 5,
    'multi': 1
  },{
    'type': 'short_test',
    'name': '15 phút',
    'max': 3,
    'multi': 1
  },{
    'type': 'long_test',
    'name': '45 phút',
    'max': 2,
    'multi': 1
  },{
    'type': 'midterm',
    'name': 'Giữa kỳ',
    'max': 1,
    'multi': 2
  },{
    'type': 'final',
    'name': 'Cuối kỳ',
    'max': 1,
    'multi': 3
  }];

  const zForm = z.object({
    message: z.string(),
    type: z.string().min(1, "Vui lòng chọn loại điểm"),
    score: z.number().min(1, "Vui lòng chọn điểm muốn phản hồi")
  });

  const [selectType, setSelectType] = useState('');

  const form = useForm({
    resolver: zodResolver(zForm),
    defaultValues: {
      message: '',
      type: '',
      score: 0,
    },
  })

  useEffect(() => {
    console.log(score)
  }, [score])

  const handleSubmit = async (data) => {
    if (submitting) return;
    setSubmitting(true);
    httpPost(appContext.getRoute('feedback.store'), data, {}, 'POST', false)
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
      hide();
      form.reset();
      setSelectType('');
    } 
  }

  useEffect(() => {
    form.reset();
  }, [score]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Phản hồi điểm môn {score?.subject?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phản hồi</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại điểm</FormLabel>
                    <FormControl>
                      <Selector
                        placeholder="Loại điểm"
                        defaultValue={field.value}
                        options={typeScores}
                        index="type"
                        label="name"
                        valueObject={false}
                        onChange={(id) => {
                          field.onChange(id)
                          setSelectType(id);
                        }}
                        unselectable={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectType && <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điểm</FormLabel>
                    <FormControl>
                      <Selector
                        placeholder="Điểm"
                        defaultValue={field.value}
                        options={score?.[selectType] ?? []}
                        index="id"
                        label={(item) => `${item.score} (${item.semester})`}
                        valueObject={false}
                        onChange={(id) => {
                          field.onChange(id)
                        }}
                        unselectable={false}
                        disabled={!score?.[selectType]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />}
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