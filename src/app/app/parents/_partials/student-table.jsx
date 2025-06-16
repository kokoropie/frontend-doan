'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { userSort } from "@/lib/utils";
import { Edit, MoreHorizontal, Trash, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppContext } from "@/contexts/app-context";

export default ({ parent = null, setParent = () => {} }) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState('');
  const [modalSubject, setModalStudent] = useState(null);

  const showModal = (sSemester, sView) => {
    setModalStudent(sSemester);
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
      accessorKey: "full_name",
      header: "Họ và tên",
      sortingFn: (rowA, rowB, id) => {
        return userSort(rowA.getValue(id), rowB.getValue(id))
      },
      cell: ({ row }) => (
        <div>{row.getValue("full_name")}</div>
      ),
    },
    {
      accessorKey: "current_class",
      header: "Lớp",
      cell: ({ row }) => (
        <div>{row.getValue("current_class")?.name}</div>
      )
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => showModal(row.original, 'edit')}>
                <Edit />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => showModal(row.original, 'delete')}>
                <Trash />
                <span>Xoá</span>
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

  const loadData = async (page = 1, clear = false) => {
    if (loading) return;
    setLoading(true);
    httpGet(appContext.getRoute('users.index'), { 
      params: {
        page: page,
        per_page: 500,
        sort_by: ['first_name', 'last_name'],
        sort: ['asc', 'asc'],
        roles: 'student',
        parent_id: parent.id,
        with: ['currentClass']
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
    setLoading(false);
    setData([]);
    setMeta(null);
  }, [parent])

  useEffect(() => {
    if (!loading && parent) {
      if (!meta || meta.current_page < meta.last_page) {
        loadData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [loading, meta, parent])

  if (!parent) return null;

  return (
    <Card className="pb-0 w-1/2 gap-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Con của <b>{parent?.first_name}</b></h2>
          <div className="flex items-center">
            <Button className="ml-2" size="sm" disabled={loading} onClick={() => showModal(null, 'add')}>
              Thêm
            </Button>
            <Button size="sm" variant="secondary" className="ml-2" disabled={loading} onClick={() => setParent(null)}>
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        <Separator className="mt-1" />
      </CardHeader>
      <CardContent>
        <Block isBlocking={loading}>
          <Table data={data} columns={columns} />
        </Block>
      </CardContent>
      {/* <SubjectModal open={modal == 'edit' || modal == 'add'} 
        hide={() => {
          setModalStudent(null)
          setModal('');
        }} _class={_class} 
        semester={_class?.semesters?.find(i => i.id == semester)} 
        teachers={teachers} 
        students={students?.filter(i => !data?.find(j => j.id == i.id) || i.id == modalSubject?.id)} 
        subject={modalSubject} 
        onSuccess={(y) => {
          setModalStudent(null)
          setModal('');
          loadData(1, true);
        }} /> */}
      {/* <DeleteSemesterModal open={modalSubject && modal == 'delete'} hide={() => {
        setModalStudent(null)
        setModal('');
      }} teachers={teachers} semesters={modalSubject} setSemesters={setModalStudent} onSuccess={() => {
        setModalStudent(null)
        setModal('');
        loadData(1, true);
      }} /> */}
    </Card>
  );
}