'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppContext } from "@/contexts/app-context";
import { httpPost } from "@/lib/http";
import { useContext, useState } from "react";
import { toast } from "sonner";

export default function SetYearModal({ open = false, hide = () => { }, year = null, setYear = () => { }, onSuccess = () => {} }) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    httpPost(appContext.getRoute('academic-years.set-year', [year.id]))
      .then(res => res.data)
      .then((data) => {
        if (data.status === "success") {
          toast.success(data.message);
          onSuccess();
        } else {
          throw new Error(data.message || "Xảy ra lỗi");
        }
      })
      .finally(() => {
        setSubmitting(false);
      })
  }

  return (
    <Dialog open={open} onOpenChange={hide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chuyển năm học</DialogTitle>
        </DialogHeader>
        <div>
          <p>Bạn có chắc chắn muốn chuyển sang năm học <strong>{year?.year}</strong> không?</p>
        </div>
        <DialogFooter>
          <Button type="submit" variant="warning" disabled={submitting} onClick={handleSubmit}>
            Đổi
          </Button>
          <DialogClose asChild>
            <Button variant="outline" disabled={submitting}>
              Hủy
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}