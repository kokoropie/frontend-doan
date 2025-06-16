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

export default ({ _class = null, setClass = () => {} }) => {
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
      accessorKey: "parents",
      header: "Phụ huynh",
      cell: ({ row }) => (
        <div>{row.getValue("parents")?.map((i) => i.first_name).join(", ")}</div>
      ),
      enableSorting: false,
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
        class_id: _class.id,
        with: ['parents']
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
  }, [_class])

  useEffect(() => {
    if (!loading && _class) {
      if (!meta || meta.current_page < meta.last_page) {
        loadData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [loading, meta, _class])

  useEffect(() => {
    // httpGet(appContext.getRoute('users.index', [_class.id]), { 
    //   params: {
    //     no_relations: 1,
    //     no_pagination: 1,
    //     sort_by: ['first_name', 'last_name'],
    //     sort: ['asc', 'asc'],
    //     roles: 'teacher',
    //   }
    // })
    // .then((res) => {
    //   if (res.status === 200) {
    //     const { data } = res.data.data;
    //     setTeachers(data);
    //   } else {
    //     toast.error(res.data.message);
    //   }
    // });
  }, [])

  if (!_class) return null;

  return (
    <Card className="pb-0 w-1/2 gap-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Học sinh lớp {_class.name} ({_class.year?.year})</h2>
          <div className="flex items-center">
            <Button className="ml-2" size="sm" disabled={loading} onClick={() => showModal(null, 'add')}>
              Thêm
            </Button>
            <Button size="sm" variant="secondary" className="ml-2" disabled={loading} onClick={() => setClass(null)}>
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