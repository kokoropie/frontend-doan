'use client';

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Eye, X } from "lucide-react";
import { useContext, useState } from "react";
import FeedbackTable from "./_partials/feedback-table";
import FeedbackModal from "./_partials/feedback-modal";
import { httpPatch } from "@/lib/http";
import { AppContext } from "@/contexts/app-context";
import RejectModal from "./_partials/reject-modal";

export default () => {
  const appContext = useContext(AppContext);
  const [status, setStatus] = useState('pending');
  const [feedback, setFeedback] = useState(null);
  const [modal, setModal] = useState('details');
  const handleApprove = (_feedback) => {
    httpPatch(appContext.getRoute('feedback.update', [_feedback.id]), {
      status: 'in_progress'
    })
      .then((res) => {
        if (res.status === 200) {
          setStatus(res.data.data);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => {
        console.error('Error approving feedback:', error);
        toast.error('Có lỗi xảy ra khi tiếp nhận phản hồi');
      });
  }

  const handleReject = () => {
    setStatus('resolved');
    setModal('details');
    setFeedback(null);
  }

  const handleResolve = (_feedback) => {
    httpPatch(appContext.getRoute('feedback.update', [_feedback.id]), {
      status: 'resolved'
    })
      .then((res) => {
        if (res.status === 200) {
          setStatus(res.data.data);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => {
        console.error('Error approving feedback:', error);
        toast.error('Có lỗi xảy ra khi tiếp nhận phản hồi');
      });
  }

  const columnsPending = [
    {
      accessorKey: "parent",
      header: "Phụ huynh",
      cell: ({ row }) => (
        <div>{row.getValue("parent")?.full_name}</div>
      ),
    },
    {
      accessorKey: "score",
      header: "Lớp",
      cell: ({ row }) => (
        <div>{row.getValue("score")?.class.name} ({row.getValue("score")?.class.year.year})</div>
      ),
    },
    {
      accessorKey: "message",
      header: "Tin nhắn",
      cell: ({ row }) => (
        <div className="truncate max-w-2xl">{row.getValue("message")}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Gửi lúc",
      cell: ({ row }) => (
        <div>{row.getValue("created_at")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const _feedback = row.original;
        return (
          <div className="space-x-2">
            <Button variant="ghost" size="icon" className="size-6 p-0" onClick={() => {
              setFeedback(_feedback);
              setModal('details');
            }}>
              <span className="sr-only">Xem chi tiết</span>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6 p-0" onClick={() => {
              handleApprove(_feedback);
            }}>
              <span className="sr-only">Tiếp nhận</span>
              <Check className="size-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6 p-0" onClick={() => {
              setFeedback(_feedback);
              setModal('reject');
            }}>
              <span className="sr-only">Từ chối</span>
              <X className="size-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];
  const columnsInProcess = [
    {
      accessorKey: "parent",
      header: "Phụ huynh",
      cell: ({ row }) => (
        <div>{row.getValue("parent")?.full_name}</div>
      ),
    },
    {
      accessorKey: "score",
      header: "Lớp",
      cell: ({ row }) => (
        <div>{row.getValue("score")?.class.name} ({row.getValue("score")?.class.year.year})</div>
      ),
    },
    {
      accessorKey: "message",
      header: "Tin nhắn",
      cell: ({ row }) => (
        <div className="truncate max-w-2xl">{row.getValue("message")}</div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Tiếp nhận lúc",
      cell: ({ row }) => (
        <div>{row.getValue("updated_at")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const _feedback = row.original;
        return (
          <div className="space-x-2">
            <Button variant="ghost" size="icon" className="size-6 p-0" onClick={() => {
              setFeedback(_feedback);
              setModal('details');
            }}>
              <span className="sr-only">Xem chi tiết</span>
              <Eye className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6 p-0" onClick={() => {
              handleResolve(_feedback);
            }}>
              <span className="sr-only">Hoàn thành</span>
              <Check className="size-4 text-green-500" />
            </Button>
          </div>
        );
      },
    },
  ];
  const columnsResolved = [
    {
      accessorKey: "parent",
      header: "Phụ huynh",
      cell: ({ row }) => (
        <div>{row.getValue("parent")?.full_name}</div>
      ),
    },
    {
      accessorKey: "score",
      header: "Lớp",
      cell: ({ row }) => (
        <div>{row.getValue("score")?.class.name} ({row.getValue("score")?.class.year.year})</div>
      ),
    },
    {
      accessorKey: "message",
      header: "Tin nhắn",
      cell: ({ row }) => (
        <div className="truncate max-w-2xl">{row.getValue("message")}</div>
      ),
    },
    {
      accessorKey: "updated_at",
      header: "Giải quyết lúc",
      cell: ({ row }) => (
        <div>{row.getValue("updated_at")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const _feedback = row.original;
        return (
          <div className="space-x-2">
            <Button variant="ghost" size="icon" className="size-6 p-0" onClick={() => {
              setFeedback(_feedback);
              setModal('details');
            }}>
              <span className="sr-only">Xem chi tiết</span>
              <Eye className="size-4" />
            </Button>
          </div>
        );
      },
    }
  ];

  return (
    <div>
      <Tabs value={status} onValueChange={(value) => {
        setStatus(value);
      }}>
        <TabsList>
          <TabsTrigger value="pending">Chưa xử lý</TabsTrigger>
          <TabsTrigger value="in_progress">Đang xử lý</TabsTrigger>
          <TabsTrigger value="resolved">Đã xử lý</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <FeedbackTable open={status == 'pending'} status="pending" columns={columnsPending} title="Chưa xử lý" description="Danh sách phản hồi chưa được xử lý" />
        </TabsContent>
        <TabsContent value="in_progress">
          <FeedbackTable open={status == 'in_progress'} status="in_progress" columns={columnsInProcess} title="Đang xử lý" description="Danh sách phản hồi đang được xử lý" />
        </TabsContent>
        <TabsContent value="resolved">
          <FeedbackTable open={status == 'resolved'} status="resolved" columns={columnsResolved} title="Đã xử lý" description="Danh sách phản hồi đã được xử lý" />
        </TabsContent>
      </Tabs>
      <FeedbackModal open={modal == 'details' && !!feedback} hide={() => setFeedback(null)} feedback={feedback} />
      <RejectModal open={modal == 'reject' && !!feedback} hide={() => setFeedback(null)} feedback={feedback} onSuccess={handleReject} />
    </div>
  )
}