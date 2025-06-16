'use client';

import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Eye } from "lucide-react";
import { useState } from "react";
import FeedbackTable from "./_partials/feedback-table";
import FeedbackModal from "./_partials/feedback-modal";

export default () => {
  const [status, setStatus] = useState('pending');
  const [feedback, setFeedback] = useState(null);

  const columnsPending = [
    {
      accessorKey: "student",
      header: "Con",
      cell: ({ row }) => (
        <div>{row.getValue("student")?.full_name}</div>
      ),
    },
    {
      accessorKey: "teacher",
      header: "Giáo viên",
      cell: ({ row }) => (
        <div>{row.getValue("teacher")?.full_name}</div>
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
            }}>
              <span className="sr-only">Xem chi tiết</span>
              <Eye className="size-4" />
            </Button>
            {/* <Button variant="ghost" size="icon" className="size-6 p-0">
              <span className="sr-only">Yêu cầu xử lý</span>
              <Clock className="size-4 text-orange-500" />
            </Button> */}
          </div>
        );
      },
    },
  ];
  const columnsInProcess = [
    {
      accessorKey: "student",
      header: "Con",
      cell: ({ row }) => (
        <div>{row.getValue("student")?.full_name}</div>
      ),
    },
    {
      accessorKey: "teacher",
      header: "Giáo viên",
      cell: ({ row }) => (
        <div>{row.getValue("teacher")?.full_name}</div>
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
      header: "Tiếp nhận lúc",
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
            }}>
              <span className="sr-only">Xem chi tiết</span>
              <Eye className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
  const columnsResolved = [
    {
      accessorKey: "student",
      header: "Con",
      cell: ({ row }) => (
        <div>{row.getValue("student")?.full_name}</div>
      ),
    },
    {
      accessorKey: "teacher",
      header: "Giáo viên",
      cell: ({ row }) => (
        <div>{row.getValue("teacher")?.full_name}</div>
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
      header: "Giải quyết lúc",
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
      <FeedbackModal open={!!feedback} hide={() => setFeedback(null)} feedback={feedback} />
    </div>
  )
}