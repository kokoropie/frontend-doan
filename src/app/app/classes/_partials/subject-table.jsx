'use client';
import Selector from "@/components/form/selector";
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
import SubjectModal from "./subject-modal";
import { AppContext } from "@/contexts/app-context";
import CopySubjectModal from "./copy-subject-modal";
import DeleteSubjectModal from "./delete-subject-modal";

export default ({ _class = null, setClass = () => {} }) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState('');
  const [modalSubject, setModalSubject] = useState(null);
  const [semester, setSemester] = useState(_class?.semesters[0]?.id ?? null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [init, setInit] = useState(true);

  const showModal = (sSemester, sView) => {
    setModalSubject(sSemester);
    setModal(sView);
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Môn học",
      cell: ({ row }) => (
        <div>{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "teacher",
      header: "Giáo viên",
      sortingFn: (rowA, rowB, id) => {
        return userSort(rowA.getValue(id), rowB.getValue(id))
      },
      cell: ({ row }) => (
        <div>{row.getValue("teacher")?.full_name}</div>
      ),
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
    httpGet(appContext.getRoute('classes.subjects.index', [_class.id]), { 
      params: {
        page: page,
        per_page: 500,
        semester: semester,
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
    if (init) {
      setInit(false);
      return;
    }
    loadData(1, true);
  }, [semester])

  useEffect(() => {
    if (appContext.hasRole('admin')) {
      httpGet(appContext.getRoute('subjects.index', [_class.id]), { 
        params: {
          no_relations: 1,
          no_pagination: 1,
          sort_by: ['name'],
          sort: ['asc'],
        }
      })
      .then((res) => {
        if (res.status === 200) {
          const { data } = res.data.data;
          setSubjects(data);
        } else {
          toast.error(res.data.message);
        }
      });
      httpGet(appContext.getRoute('users.index', [_class.id]), { 
        params: {
          no_relations: 1,
          no_pagination: 1,
          sort_by: ['first_name', 'last_name'],
          sort: ['asc', 'asc'],
          roles: 'teacher',
        }
      })
      .then((res) => {
        if (res.status === 200) {
          const { data } = res.data.data;
          setTeachers(data);
        } else {
          toast.error(res.data.message);
        }
      });
    }
  }, [appContext])

  if (!_class) return null;

  return (
    <Card className="pb-0 w-1/2 gap-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Môn học lớp {_class.name} ({_class.year?.year})</h2>
          <div className="flex items-center">
            <Selector 
              className="ml-auto"
              placeholder="Học kỳ"
              defaultValue={semester}
              options={_class.semesters}
              index="id"
              label="name"
              valueObject={false}
              onChange={(v) => {
                setSemester(v);
              }}
              unselectable={false}
            />
            {appContext.hasRole('admin') && <>
              <Button className="ml-2" size="sm" disabled={loading} onClick={() => showModal(semester, 'copy')}>
                Sao chép
              </Button>
              <Button className="ml-2" size="sm" disabled={loading} onClick={() => showModal(null, 'add')}>
                Thêm
              </Button>
            </>}
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
      <SubjectModal open={modal == 'edit' || modal == 'add'} 
        hide={() => {
          setModalSubject(null)
          setModal('');
        }} _class={_class} 
        semester={_class?.semesters?.find(i => i.id == semester)} 
        teachers={teachers} 
        subjects={subjects?.filter(i => !data?.find(j => j.id == i.id) || i.id == modalSubject?.id)} 
        subject={modalSubject} 
        onSuccess={(y) => {
          setModalSubject(null)
          setModal('');
          loadData(1, true);
        }} />
      <CopySubjectModal open={modal == 'copy'} 
        hide={() => {
          setModalSubject(null)
          setModal('');
        }} _class={_class} 
        semester={_class?.semesters?.find(i => i.id == semester)} 
        onSuccess={(y) => {
          setModalSubject(null)
          setModal('');
          loadData(1, true);
        }} />
      <DeleteSubjectModal open={modalSubject && modal == 'delete'} hide={() => {
        setModalSubject(null)
        setModal('');
      }} subject={modalSubject} _class={_class} onSuccess={() => {
        setModalSubject(null)
        setModal('');
        loadData(1, true);
      }} />
    </Card>
  );
}