'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppContext } from "@/contexts/app-context";
import { httpDelete } from "@/lib/http";
import { useContext, useState } from "react";
import { toast } from "sonner";

export default function ({ open = false, hide = () => { }, user = null, setUser = () => { }, label = '', note = '', onSuccess = () => {} }) {
  const appContext = useContext(AppContext);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    httpDelete(appContext.getRoute('users.destroy', [user.id]))
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
          <DialogTitle>Xoá {label}</DialogTitle>
        </DialogHeader>
        <div>
          Bạn có chắc chắn muốn xoá {label} <strong>{user?.full_name}</strong> không?
          <br />
          <span className="text-red-500">{note && `Lưu ý: ${note}`}</span>
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