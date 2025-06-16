'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { httpDelete } from "@/lib/http";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteSubjectModal({ open = false, hide = () => { }, subject = null, setSubject = () => { }, onSuccess = () => {} }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    httpDelete(`subjects/${subject.id}`)
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
          <DialogTitle>Xoá môn học</DialogTitle>
        </DialogHeader>
        <div>
          Bạn có chắc chắn muốn xoá môn <strong>{subject?.name}</strong> không?
          <br />
          <span className="text-red-500">Lưu ý: Tất cả liên kết đến các lớp học sẽ bị huỷ.</span>
        </div>
        <DialogFooter>
          <Button type="submit" variant="destructive" disabled={submitting} onClick={handleSubmit}>
            Xoá
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