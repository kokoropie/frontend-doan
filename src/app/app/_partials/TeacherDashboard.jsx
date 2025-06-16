'use client';

import Table from "@/components/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Block from "@/components/ui/block";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { AppContext } from "@/contexts/app-context";
import { httpGet } from "@/lib/http";
import { GraduationCap, MessagesSquare, Users } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import CountUp from "react-countup";

export default ({ counts }) => {
  const appContext = useContext(AppContext);

  const columnsFeedback = [
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
  ];
  const [dataFeedback, setDataFeedback] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  const pushData = (newData, clear = false) => {
    let cD = clear ? [] : [...dataFeedback];
    const cloneData = [...cD, ...newData];
    setDataFeedback(cloneData.filter((item, index) => cloneData.indexOf(item) === index));
  };

  const fetchData = (page = 1, clear = false) => {
    if (loading) return;
    setLoading(true);
    httpGet(appContext.getRoute('dashboard.feedback'), {
      params: {
        page: page,
        per_page: 500
      }
    })
      .then((res) => {
        if (res.status === 200) {
          const { data, meta } = res.data.data;
          pushData(data, clear);
          setMeta(meta);
        } else {
          toast.error(res.data.message);
        }
      }).finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!loading) {
      if (!meta || meta.current_page < meta.last_page) {
        fetchData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [meta])

  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarFallback><MessagesSquare className="size-10" /></AvatarFallback>
            </Avatar>
            <div>
              Số lượng phản hồi/góp ý chưa xử lý
              <div className="text-2xl"><CountUp end={counts?.feedback} /></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarFallback><MessagesSquare className="size-10" /></AvatarFallback>
            </Avatar>
            <div>
              Số lượng thông báo đã gửi
              <div className="text-2xl"><CountUp end={counts?.notifications} /></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="grid grid-cols-1 gap-3">
      <Card>
        <CardContent>
          <CardTitle>Danh sách phản hồi/góp ý chưa xử lý</CardTitle>
          <Block isBlocking={loading}>
            <Table data={dataFeedback} columns={columnsFeedback} isSelectingRow={false} className="mt-3" />
          </Block>
        </CardContent>
      </Card>
    </div>
  </div>
}