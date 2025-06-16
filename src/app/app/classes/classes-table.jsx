'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { cn, numberFormat, userSort } from "@/lib/utils";
import { Edit, GraduationCap, MoreHorizontal, Table2, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import DeleteClassModal from "./_partials/delete-class-modal";
import { useRouter, useSearchParams } from "next/navigation";
import Selector from "@/components/form/selector";
import ClassModal from "./_partials/class-modal";
import { AppContext } from "@/contexts/app-context";
import ScoreModal from "./_partials/score-modal";

export default ({_class = null, setClass = () => {}, view = '', setView = () => {}}) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalClass, setModalClass] = useState(null);
  const [modalYear, setModalYear] = useState(null);
  const [modal, setModal] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [years, setYears] = useState([]);
  const [year, setYear] = useState(null);
  const searchParams = useSearchParams();
  const [paramYear, setParamYear] = useState(searchParams.get('year'));
  const [init, setInit] = useState(true);
  const router = useRouter();

  const handleSetClass = (sClass, sView) => {
    setClass(sClass);
    setView(sView);
  };

  const showModal = (sClass, sView) => {
    setModalClass(sClass);
    setModalYear(sClass?.year ?? null);
    setModal(sView);
  };

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
      header: "Lớp",
      cell: ({ row }) => (
        <div>{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "year",
      header: "Năm học",
      cell: ({ row }) => (
        <div>{row.getValue("year")?.year}</div>
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
      accessorKey: "teacher",
      header: "Chủ nhiệm",
      sortingFn: (rowA, rowB, id) => {
        return userSort(rowA.getValue(id), rowB.getValue(id))
      },
      cell: ({ row }) => (
        <div>{row.getValue("teacher")?.full_name}</div>
      ),
    },
    {
      accessorKey: "students_count",
      header: <div className="text-right">Số học sinh</div>,
      cell: ({ row }) => (
        <div className="text-right">{numberFormat(row.getValue("students_count"))}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
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
              <DropdownMenuItem onClick={() => handleSetClass(_class, 'students')}>
                <GraduationCap />
                <span>Xem học sinh</span>
              </DropdownMenuItem>
              {_class?.semesters?.length > 0 && <>
                <DropdownMenuItem onClick={() => handleSetClass(_class, 'subjects')}>
                  <Table2 />
                  <span>Xem môn học</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => showModal(_class, 'scores')}>
                  <Table2 />
                  <span>Xem bảng điểm</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={appContext.getRoute(`classes.scores.excel`, [_class.id])} target="_blank">
                    <Table2 />
                    <span>Xuất bảng điểm</span>
                  </a>
                </DropdownMenuItem>
              </>}
              {appContext.hasRole('admin') && <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => showModal(_class, 'edit')}>
                  <Edit />
                  <span>Chỉnh sửa</span>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => showModal(_class, 'delete')}>
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
    httpGet(appContext.getRoute(`classes.index`), {
      params: {
        year: paramYear,
        page: page,
        per_page: 50
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
    if (!loading && year) {
      if (!meta || meta.current_page < meta.last_page) {
        loadData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [meta, year])

  useEffect(() => {
    httpGet(appContext.getRoute(`academic-years.index`), {
      params: {
        no_relations: 1,
        no_pagination: 1,
        sort_by: 'id',
        sort: 'desc',
      }
    }).then((res) => {
      if (res.status === 200) {
        const { data } = res.data.data;
        setYears(data);
        if (paramYear) {
          setYear(data.find(i => i.id == paramYear));
        } else {
          const _year = data.find(i => i.current);
          setYear(_year ?? null);
          setParamYear(_year?.id ?? null);
        }
      } else {
        toast.error(res.data.message);
      }
    })
    if (appContext.hasRole('admin')) {
      httpGet(appContext.getRoute('users.index'), {
        params: {
          no_relations: 1,
          no_pagination: 1,
          sort_by: ['first_name', 'last_name'],
          sort: ['asc', 'asc'],
          roles: 'teacher',
        }
      }).then((res) => {
        if (res.status === 200) {
          const { data } = res.data.data;
          setTeachers(data);
        } else {
          toast.error(res.data.message);
        }
      })
    }
  }, [appContext])

  useEffect(() => {
    if (paramYear) {
      const _year = years.find(i => i.id == paramYear);
      if (_year) {
        setYear(_year);
      } else {
        setYear(years.find(i => i.current) ?? years[0] ?? null);
      }
    } else {
      setYear(years.find(i => i.current) ?? years[0] ?? null);
    }
  }, [years, paramYear])

  useEffect(() => {
    if (init) {
      setInit(false);
      return;
    }
    loadData(1, true);
  }, [paramYear])

  return (
    <Card className={cn("pb-0 gap-0", !!view ? 'w-1/2' : 'w-full')}>
      <CardHeader>
        <div className="flex items-center justify-end">
          <h2 className="text-lg font-semibold">Lớp</h2>
          <Selector 
              className="ml-auto"
              placeholder="Năm học"
              defaultValue={year}
              options={years}
              index="id"
              label="year"
              onChange={(sYear) => {
                setParamYear(sYear?.id ?? null);
              }}
            />
          {appContext.hasRole('admin') && <Button className="ml-3" size="sm" disabled={loading} onClick={() => showModal(null, 'add')}>
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
        <ClassModal open={modal == 'add' || modal == 'edit'} hide={() => {
          setModalClass(null)
          setModal('');
        }} years={years} teachers={teachers} _class={modalClass} setClass={setModalClass} onSuccess={(c) => {
          setModalClass(null)
          setModal('');
          loadData(1, true);
        }} />
        <DeleteClassModal open={modalClass && modal == 'delete'} hide={() => {
          setModalClass(null)
          setModal('');
        }} _class={modalClass} setClass={setModalClass} onSuccess={() => {
          setModalClass(null)
          setModal('');
          loadData(1, true);
        }} />
      </>}
      <ScoreModal open={modalClass && modal == 'scores'} hide={() => {
        setModalClass(null);
        setModal('');
      }} _class={modalClass} setClass={setModalClass} />
    </Card>
  );
}