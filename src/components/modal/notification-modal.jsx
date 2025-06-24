'use client'

import { AppContext } from "@/contexts/app-context"
import { useContext, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { httpGet } from "@/lib/http";

export default ({open = false, hide = () => {}}) => {
  const appContext = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const onClose = (o) => {
    if (!o) {
      hide();
    }
  }

  const handleMarkAsRead = () => {

  }

  const [data, setData] = useState([]);

  const loadData = () => {
    if (loading) return;
    setLoading(true);
    httpGet(appContext.getRoute('notifications.index')).then((res) => {
      setData(res.data.data);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông báo</DialogTitle>
        </DialogHeader>
        <div className="space-y-0.5">
          {data.map((item, index) => (
            <div key={index} className={`p-2 rounded-md ${item.is_read ? 'bg-gray-100' : 'bg-blue-100'}`}>
              <div className="text-sm font-semibold">{item.title}</div>
              <div className="text-xs text-gray-600">{item.message}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button disabled={loading} onClick={handleMarkAsRead}>Đánh dấu đã đọc</Button>
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