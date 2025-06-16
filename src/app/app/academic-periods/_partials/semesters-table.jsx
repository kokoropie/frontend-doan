'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { Edit, MoreHorizontal, Trash, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import SemesterModal from "./semester-modal";
import DeleteSemesterModal from "./delete-semester-modal";
import { AppContext } from "@/contexts/app-context";

export default ({ year = null, setYear = () => {} }) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState('');
  const [modalSemester, setModalSemester] = useState(null);

  const showModal = (sSemester, sView) => {
    setModalSemester(sSemester);
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
      header: "Tên",
      cell: ({ row }) => (
        <div>{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "classes_count",
      header: <div className="text-right">Số lớp</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("classes_count")}</div>
      ),
    },
    {
      id: "actions",
      hidden: !appContext.hasRole('admin'),
      cell: ({ row }) => {
        // const year = row.original

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
    httpGet(appContext.getRoute('academic-years.semesters.index', [year.id]), {
      params: {
        page: page,
        per_page: 500,
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
  }, [year])

  useEffect(() => {
    if (!loading && year) {
      if (!meta || meta.current_page < meta.last_page) {
        loadData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [loading, meta, year])

  if (!year) return null;

  return (
    <Card className="pb-0 w-1/2 gap-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Năm học {year.year}</h2>
          <div className="flex items-center">
            <Button size="sm" disabled={loading} onClick={() => showModal(null, 'add')}>
              Thêm
            </Button>
            <Button size="sm" variant="secondary" className="ml-2" disabled={loading} onClick={() => setYear(null)}>
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        <Separator className="mt-1" />
      </CardHeader>
      <CardContent>
        <Block isBlocking={loading}>
          <Table data={data} columns={columns} isSelectingRow />
        </Block>
      </CardContent>
      {appContext.hasRole('admin') && <>
        <SemesterModal open={modal == 'edit' || modal == 'add'} hide={() => {
          setModalSemester(null)
          setModal('');
        }} year={year} semester={modalSemester} setSemester={setModalSemester} onSuccess={(y) => {
          setModalSemester(null)
          setModal('');
          loadData(1, true);
        }} />
        <DeleteSemesterModal open={modalSemester && modal == 'delete'} hide={() => {
          setModalSemester(null)
          setModal('');
        }} year={year} semesters={modalSemester} setSemesters={setModalSemester} onSuccess={() => {
          setModalSemester(null)
          setModal('');
          loadData(1, true);
        }} />
      </>}
    </Card>
  );
}