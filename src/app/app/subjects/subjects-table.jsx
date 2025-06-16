'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { cn } from "@/lib/utils";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import SubjectModal from "./_partials/subject-modal";
import DeleteSubjectModal from "./_partials/delete-subject-modal";
import { AppContext } from "@/contexts/app-context";

export default ({subject = null, setSubject = () => {}, view = null, setView = () => {}}) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalSubject, setModalSubject] = useState(null);
  const [modal, setModal] = useState('');

  const showModal = (sClass, sView) => {
    setModalSubject(sClass);
    setModal(sView);
  }

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div>{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Môn học",
      cell: ({ row }) => (
        <div>{row.getValue("name")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      hidden: !appContext.hasRole('admin'),
      cell: ({ row }) => {
        const _class = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => showModal(_class, 'view')}>
                <Eye />
                <span>Xem chi tiết</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showModal(_class, 'edit')}>
                <Edit />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => showModal(_class, 'delete')}>
                <Trash />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  const pushData = (newData, clear = false) => {
    let cD = clear ? [] : [...data];
    const cloneData = [...cD, ...newData];
    setData(cloneData.filter((item, index) => cloneData.indexOf(item) === index));
  };

  const loadData = (page = 1, clear = false) => {
    if (loading) return;
    setLoading(true);
    httpGet(appContext.getRoute('subjects.index'), {
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
        loadData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [meta])

  return (
    <Card className="pb-0 gap-0 w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Môn học</h2>
          {appContext.hasRole('admin') && <Button size="sm" disabled={loading} onClick={() => showModal(null, 'add')}>
            Thêm
          </Button>}
        </div>
        <Separator className="mt-1" />
      </CardHeader>
      <CardContent>
        <Block isBlocking={loading}>
          <Table data={data} columns={columns} isSelectingRow />
        </Block>
      </CardContent>
      {appContext.hasRole('admin') && <>
        <SubjectModal open={modal == 'add' || modal == 'edit'} hide={() => {
          setModalSubject(null)
          setModal('');
        }} subject={modalSubject} setSubject={setModalSubject} onSuccess={(c) => {
          setModalSubject(null)
          setModal('');
          loadData(1, true);
        }} />
        <DeleteSubjectModal open={modalSubject && modal == 'delete'} hide={() => {
          setModalSubject(null)
          setModal('');
        }} subject={modalSubject} setSubject={setModalSubject} onSuccess={() => {
          setModalSubject(null)
          setModal('');
          loadData(1, true);
        }} />
      </>}
    </Card>
  );
}