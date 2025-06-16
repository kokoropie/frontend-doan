'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { cn, numberFormat, userSort } from "@/lib/utils";
import { Edit, GraduationCap, Key, MoreHorizontal, RotateCwSquare, Table2, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import UserModal from "@/components/modal/user-modal";
import ChangePasswordModal from "@/components/modal/change-password-modal";
import PasswordModal from "@/components/modal/password-modal";
import DeleteUserModal from "@/components/modal/delete-user-modal";
import { AppContext } from "@/contexts/app-context";
import ChangeClassModal from "./_partials/change-class-modal";

export default ({student = null, setStudent = () => {}, view = '', setView = () => {}}) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [modal, setModal] = useState('');
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isUpdatePassword, setIsUpdatePassword] = useState(false);
  const searchParams = useSearchParams();
  const [paramYear, setParamYear] = useState(searchParams.get('year'));
  const router = useRouter();

  const handleSetStudent = (sClass, sView) => {
    setStudent(sClass);
    setView(sView);
  }

  const showModal = (sClass, sView) => {
    setModalStudent(sClass);
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
        return userSort(rowA.original, rowB.original)
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
      accessorKey: "current_class",
      header: "Lớp",
      cell: ({ row }) => (
        <div>{row.getValue("current_class")?.name}</div>
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSetStudent(student, 'scores')}>
                <Table2 />
                <span>Xem bảng điểm</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => showModal(student, 'change-class')}>
                <RotateCwSquare />
                <span>Chuyển lớp</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => showModal(student, 'edit')}>
                <Edit />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => showModal(student, 'change-password')}>
                <Key />
                <span>Đổi mật khẩu</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => showModal(student, 'delete')}>
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
    httpGet(appContext.getRoute('users.index'), {
      params: {
        year: paramYear,
        page: page,
        per_page: 500,
        roles: 'student',
        with: ['parents', 'currentClass']
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

  useEffect(() => {
    httpGet(appContext.getRoute('users.index'), {
      params: {
        no_relations: 1,
        no_pagination: 1,
        roles: 'parent'
      }
    })
    .then((res) => {
      if (res.status === 200) {
        const { data } = res.data.data;
        setParents(data);        
      } else {
        toast.error(res.data.message);
      }
    });
    httpGet(appContext.getRoute('classes.index'), {
      params: {
        no_relations: 1,
        no_pagination: 1
      }
    })
    .then((res) => {
      if (res.status === 200) {
        const { data } = res.data.data;
        setClasses(data);        
      } else {
        toast.error(res.data.message);
      }
    });
  }, [])

  return (
    <Card className={cn("pb-0 gap-0", !!view ? 'w-1/2' : 'w-full')}>
      <CardHeader>
        <div className="flex items-center justify-end">
          <h2 className="text-lg font-semibold">Học sinh</h2>
          <Button className="ml-auto" size="sm" disabled={loading} onClick={() => showModal(null, 'add')}>
            Thêm
          </Button>
        </div>
        <Separator className="mt-1" />
      </CardHeader>
      <CardContent>
        <Block isBlocking={loading}>
          <Table data={data} columns={columns} isSelectingRow />
        </Block>
      </CardContent>
      <UserModal open={modal == 'add' || modal == 'edit'} 
        hide={() => {
          setModalStudent(null);
          setModal('');
        }} role="student" label="học sinh" user={modalStudent} setUser={setModalStudent} onSuccess={(c) => {
          if (c.password) {
            setModalStudent(c)
            setModal('password');
            setIsUpdatePassword(false);
          } else {
            setModalStudent(null);
            setModal('');
          }
          loadData(1, true);
        }} 
        relationship={modalStudent ? {} : {parents: "full_name", classes: "name"}} 
        relationshipLabel={{parents: "phụ huynh", classes: "lớp"}} 
        relationshipData={{parents: parents, classes: classes}} 
      />
      <ChangePasswordModal open={modal == 'change-password' && modalStudent} hide={() => {
        setModalStudent(null);
        setModal('');
      }} user={modalStudent} label="học sinh" onSuccess={(c) => {
        setModalStudent(c);
        setModal('password');
        setIsUpdatePassword(true);
      }} />
      <ChangeClassModal open={modal == 'change-class' && modalStudent} hide={() => {
        setModalStudent(null);
        setModal('');
      }} user={modalStudent} classes={classes} onSuccess={() => {
        setModalStudent(null);
        setModal('');
        loadData(1, true);
      }} />
      <PasswordModal open={modal == 'password'} hide={() => {
        setModalStudent(null);
        setModal('');
      }} user={modalStudent} label="học sinh" changePassword={isUpdatePassword} />
      <DeleteUserModal open={modalStudent && modal == 'delete'} hide={() => {
        setModalStudent(null);
        setModal('');
      }} user={modalStudent} label="học sinh" setUser={setModalStudent} onSuccess={() => {
        setModalStudent(null);
        setModal('');
        loadData(1, true);
      }} note="Ngoại trừ điểm, tất cả các liên kết sẽ bị huỷ." />
    </Card>
  );
}