'use client';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppContext } from "@/contexts/app-context";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { httpPatch } from "@/lib/http";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

export default ({ open = false, hide = () => {}, feedback = null, onSuccess = () => {} }) => {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);
  const zForm = z.object({
      message: z.string(),
      status: z.string()
    });
  
    const form = useForm({
      resolver: zodResolver(zForm),
      defaultValues: {
        message: '',
        status: 'rejected',
      },
    })

  const onClose = (o) => {
    if (!o) {
      hide();
    }
  }

  const onReject = (data) => {
    if (submitting) return;
    setSubmitting(true);
    httpPatch(appContext.getRoute('feedback.update', [feedback.id]), data)
      .then((res) => {
        if (res.status === 200) {
          onSuccess();
          hide();
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => {
        console.error('Error rejecting feedback:', error);
        toast.error('Có lỗi xảy ra khi từ chối phản hồi');
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onReject)}>
            <DialogHeader>
              <DialogTitle>Từ chối phản hồi</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do</FormLabel>
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
                Gửi
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
  );
}