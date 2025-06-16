'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { cn, numberFormat, userSort } from "@/lib/utils";
import { Edit, GraduationCap, Key, MoreHorizontal, Table2, Trash } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordModal from "@/components/modal/password-modal";
import UserModal from "@/components/modal/user-modal";
import DeleteUserModal from "@/components/modal/delete-user-modal";
import ChangePasswordModal from "@/components/modal/change-password-modal";
import { AppContext } from "@/contexts/app-context";

export default ({teacher = null, setTeacher = () => {}, view = '', setView = () => {}}) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalTeacher, setModalTeacher] = useState(null);
  const [modal, setModal] = useState('');
  const [isUpdatePassword, setIsUpdatePassword] = useState(false);
  const searchParams = useSearchParams();
  const [paramYear, setParamYear] = useState(searchParams.get('year'));
  const router = useRouter();

  const handleSetTeacher = (sClass, sView) => {
    setTeacher(sClass);
    setView(sView);
  }

  const showModal = (sClass, sView) => {
    setModalTeacher(sClass);
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
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div>{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "received_feedback_count",
      header: "Số góp ý",
      cell: ({ row }) => (
        <div>{numberFormat(row.getValue("received_feedback_count") ?? 0)}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const teacher = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSetTeacher(teacher, 'students')}>
                <GraduationCap />
                <span>Xem học sinh</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetTeacher(teacher, 'subjects')}>
                <Table2 />
                <span>Xem môn học</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetTeacher(teacher, 'scores')}>
                <Table2 />
                <span>Xem bảng điểm</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => showModal(teacher, 'edit')}>
                <Edit />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => showModal(teacher, 'change-password')}>
                <Key />
                <span>Đổi mật khẩu</span>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => showModal(teacher, 'delete')}>
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
        roles: 'teacher',
        count: 'receivedFeedback',
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
    <Card className={cn("pb-0 gap-0", !!view ? 'w-1/2' : 'w-full')}>
      <CardHeader>
        <div className="flex items-center justify-end">
          <h2 className="text-lg font-semibold">Giáo viên</h2>
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
      <UserModal open={modal == 'add' || modal == 'edit'} hide={() => {
        setModalTeacher(null);
        setModal('');
      }} role="teacher" label="giáo viên" user={modalTeacher} setUser={setModalTeacher} onSuccess={(c) => {
        if (c.password) {
          setModalTeacher(c)
          setModal('password');
          setIsUpdatePassword(false);
        } else {
          setModalTeacher(null);
          setModal('');
        }
        loadData(1, true);
      }} />
      <ChangePasswordModal open={modal == 'change-password' && modalTeacher} hide={() => {
        setModalTeacher(null);
        setModal('');
      }} user={modalTeacher} label="giáo viên" onSuccess={(c) => {
        setModalTeacher(c);
        setModal('password');
        setIsUpdatePassword(true);
      }} />
      <PasswordModal open={modal == 'password'} hide={() => {
        setModalTeacher(null);
        setModal('');
      }} user={modalTeacher} label="giáo viên" changePassword={isUpdatePassword} />
      <DeleteUserModal open={modalTeacher && modal == 'delete'} hide={() => {
        setModal('');
      }} user={modalTeacher} label="giáo viên" setUser={setModalTeacher} onSuccess={() => {
        setModal('');
        loadData(1, true);
      }} note="Ngoại trừ điểm và góp ý, tất cả các liên kết sẽ bị huỷ." />
    </Card>
  );
}