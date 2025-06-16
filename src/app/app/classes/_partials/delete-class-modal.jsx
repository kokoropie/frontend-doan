'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppContext } from "@/contexts/app-context";
import { httpDelete } from "@/lib/http";
import { useContext, useState } from "react";
import { toast } from "sonner";

export default function DeleteClassModal({ open = false, hide = () => { }, _class = null, setClass = () => { }, onSuccess = () => {} }) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    httpDelete(appContext.getRoute('classes.destroy', [_class.id]))
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
          <DialogTitle>Xoá lớp học</DialogTitle>
        </DialogHeader>
        <div>
          Bạn có chắc chắn muốn xoá lớp <strong>{_class?.name}</strong> không?
          <br />
          <span className="text-red-500">Lưu ý: Tất cả liên kết đến các môn học, học sinh sẽ bị huỷ.</span>
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