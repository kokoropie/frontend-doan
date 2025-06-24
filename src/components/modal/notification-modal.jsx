'use client'

import { AppContext } from "@/contexts/app-context"
import { useContext, useEffect, useMemo, useState } from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { httpGet, httpPost } from "@/lib/http";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";

export default ({open = false, hide = () => {}}) => {
  const appContext = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const onClose = (o) => {
    if (!o) {
      hide();
    }
  }

  const handleMarkAsRead = () => {
    httpPost(appContext.getRoute('notifications.mark-as-read')).then(() => {
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
      hide();
      appContext.loadProfile();
    }).catch(err => {
      console.error(err);
      toast.error('Đánh dấu thông báo là đã đọc không thành công');
    });
  }

  const [data, setData] = useState([]);

  const hasUnread = useMemo(() => {
    return data.some(item => !item.is_read);
  }, [data])

  const loadData = () => {
    if (loading) return;
    setLoading(true);
    httpGet(appContext.getRoute('notifications.index')).then((res) => {
      setData(res.data.data.data);
    }).finally(() => {
      setLoading(false);
    })
  }

  useEffect(() => {
    if (appContext.init && open) {
      loadData();
    };
  }, [appContext.init, open])

  if (appContext.loading) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-lg">
        <DialogHeader>
          <DialogTitle>Thông báo</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[50vh]">
          <div className="space-y-0.5">
            {data.map((item, index) => (
              <div key={index} className={`p-2 rounded-md ${item.is_read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="text-xs text-gray-600">{item.message}</div>
                <div className="text-xs text-gray-400 mt-1">{item.created_at}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button disabled={loading || !hasUnread} onClick={handleMarkAsRead}>Đánh dấu đã đọc</Button>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}