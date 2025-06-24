'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { cn, numberFormat } from "@/lib/utils";
import { Blocks, Calendar, Edit, GraduationCap, MoreHorizontal, Star, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import YearModal from "./_partials/year-modal";
import DeleteYearModal from "./_partials/delete-year-modal";
import Link from "next/link";
import { AppContext } from "@/contexts/app-context";
import SetYearModal from "./_partials/set-year-modal";

export default ({year = null, setYear = () => {}, view = '', setView = () => {}}) => {
  const appContext = useContext(AppContext);

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalYear, setModalYear] = useState(null);
  const [modal, setModal] = useState('');

  const handleSetYear = (sYear, sView) => {
    setYear(sYear);
    setView(sView);
  }

  const showModal = (sYear, sView) => {
    setModalYear(sYear);
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
      accessorKey: "year",
      header: "Năm học",
      cell: ({ row }) => (
        <div>{row.original.current ? <b>{row.getValue("year")}</b> : row.getValue("year")}</div>
      ),
    },
    {
      accessorKey: "from",
      header: "Từ",
      cell: ({ row }) => (
        <div>{row.getValue("from")}</div>
      ),
    },
    {
      accessorKey: "to",
      header: "Đến",
      cell: ({ row }) => (
        <div>{row.getValue("to")}</div>
      ),
    },
    {
      accessorKey: "semesters",
      header: "Học kỳ",
      enableSorting: false,
      cell: ({ row }) => (
        <div>{row.getValue("semesters").map(i => i.name).join(", ")}</div>
      ),
    },
    {
      accessorKey: "classes_count",
      header: <div className="text-right">Số lớp</div>,
      cell: ({ row }) => (
        <div className="text-right">{numberFormat(row.getValue("classes_count"))}</div>
      ),
    },
    {
      accessorKey: "students_count",
      header: <div className="text-right">{appContext.hasRole('parent') ? "Số trẻ" : "Số học sinh"}</div>,
      cell: ({ row }) => (
        <div className="text-right">{numberFormat(row.getValue("students_count"))}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const year = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSetYear(year, 'semesters')}>
                <Calendar />
                <span>Xem học kỳ</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/app/classes?year=${year.id}`}>
                  <Blocks />
                  <span>Xem lớp</span>
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => handleSetYear(year, 'students')}>
                <GraduationCap />
                <span>Xem học sinh</span>
              </DropdownMenuItem> */}
              {appContext.hasRole('admin') && <>
                <DropdownMenuSeparator />
                {!year.current && <DropdownMenuItem variant="warning" onClick={() => showModal(year, 'set-year')}>
                  <Star />
                  <span>Đặt làm năm học hiện tại</span>
                </DropdownMenuItem>}
                <DropdownMenuItem onClick={() => showModal(year, 'edit')}>
                  <Edit />
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => showModal(year, 'delete')}>
                  <Trash />
                  <span>Xóa</span>
                </DropdownMenuItem>
              </>}
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
    httpGet(appContext.getRoute(`academic-years.index`), {
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
      }).catch(() => {
        toast.error("Xảy ra lỗi, vui lòng thử lại sau.");
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
    <Card className={cn("pb-0 gap-0", !!view ? 'w-1/2' : 'w-full')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Năm học</h2>
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
        <YearModal open={modal == 'edit' || modal == 'add'} hide={() => {
          setModalYear(null)
          setModal('');
        }} year={modalYear} setYear={setModalYear} onSuccess={(y) => {
          setModalYear(null)
          setModal('');
          loadData(1, true);
        }} />
        <DeleteYearModal open={modalYear && modal == 'delete'} hide={() => {
          setModalYear(null)
          setModal('');
        }} year={modalYear} setYear={setModalYear} onSuccess={() => {
          setModalYear(null)
          setModal('');
          loadData(1, true);
        }} />
        <SetYearModal open={modalYear && modal == 'set-year'} hide={() => {
          setModalYear(null)
          setModal('');
        }} year={modalYear} setYear={setModalYear} onSuccess={() => {
          setModalYear(null)
          setModal('');
          loadData(1, true);
        }} />
      </>}
    </Card>
  );
}