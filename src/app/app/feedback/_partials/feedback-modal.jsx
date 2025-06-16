'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppContext } from "@/contexts/app-context";
import { useContext } from "react";

export default ({ open = false, hide = () => {}, feedback = null }) => {
  const appContext = useContext(AppContext);

  const onClose = (o) => {
    if (!o) {
      hide();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} className="max-w-2xl">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết phản hồi</DialogTitle>
        </DialogHeader>
        <div>
          <div className="mb-4">
            <strong>Lớp:</strong> {feedback?.score?.class?.name}
          </div>
          <div className="mb-4">
            <strong>Học kỳ:</strong> {feedback?.score?.semester?.name}
          </div>
          <div className="mb-4">
            <strong>Môn:</strong> {feedback?.score?.subject?.name}
          </div>
          {appContext.hasRole('teacher') && <>
            <div className="mb-4">
              <strong>Phụ huynh:</strong> {feedback?.parent?.full_name} ({feedback?.parent?.email})
            </div>
            <div className="mb-4">
              <strong>Học sinh:</strong> {feedback?.student?.full_name}
            </div>
          </>}
          {appContext.hasRole('parent') && <>
            <div className="mb-4">
              <strong>Con:</strong> {feedback?.student?.full_name}
            </div>
            <div className="mb-4">
              <strong>Giáo viên:</strong> {feedback?.teacher?.full_name}
            </div>
          </>}
          <div className="mb-4">
            <strong>Tin nhắn:</strong> {feedback?.message}
          </div>
          <div className="mb-4">
            <strong>Gửi lúc:</strong> {feedback?.created_at}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}