'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { httpGet } from "@/lib/http";
import { userSort } from "@/lib/utils";
import { Edit, FileText, MoreHorizontal, Table2, Trash, X } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppContext } from "@/contexts/app-context";
import Selector from "@/components/form/selector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InputScore from "./input-score";
import * as XLSX from "xlsx";

export default ({ open = false, hide = () => { }, _class = null, setClass = () => {} }) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState([]);
  const [dataScore, setDataScore] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeScore, setTypeScore] = useState('midterm');
  const [semester, setSemester] = useState(_class?.semesters[0]?.id ?? null);

  const typeScores = [{
    'type': 'other',
    'name': 'Khác',
    'max': 5,
    'multi': 1
  },{
    'type': 'short_test',
    'name': '15 phút',
    'max': 3,
    'multi': 1
  },{
    'type': 'long_test',
    'name': '45 phút',
    'max': 2,
    'multi': 1
  },{
    'type': 'midterm',
    'name': 'Giữa kỳ',
    'max': 1,
    'multi': 2
  },{
    'type': 'final',
    'name': 'Cuối kỳ',
    'max': 1,
    'multi': 3
  }];

  const subjects = useMemo(() => {
    const _subjects = [];
    for (let score of dataScore) {
      if (!_subjects.find((i) => i.subject_id === score.subject_id)) {
        _subjects.push({
          subject_id: score.subject_id,
          name: score.name,
          show_actions: dataScore.find((i) => i.subject_id === score.subject_id && i.show_actions == true) ? true : false
        });
      }
    }
    return _subjects;
  }, [dataScore])

  const columns = useMemo(() => {
    const _columns = [
      {
        accessorKey: "full_name",
        header: "Họ và tên",
        cell: ({ row }) => (
          <div>{row.getValue("full_name")}</div>
        ),
        enableSorting: false,
      },
    ];
    for (let score of subjects) {
      _columns.push({
        accessorKey: `${score.subject_id}`,
        header: score.name,
        cell: ({ row }) => (
          <InputScore 
            student={row.original} 
            score={dataScore.find((i) => i.subject_id == score.subject_id && i.student_id == row.original.id)} 
            _class={_class}
            type={typeScore}
            />
        ),
      });
    }
    return _columns;
  }, [dataScore]);

  const pushData = (newData, clear = false) => {
    let cD = clear ? [] : [...data];
    const cloneData = [...cD, ...newData];
    setData(cloneData.filter((item, index) => cloneData.indexOf(item) === index));
  };

  const loadDataScore = async () => {
    if (!_class) {
      setDataScore([]);
      return;
    }
    setLoading(true);
    httpGet(appContext.getRoute('classes.scores.index', [_class?.id]), { 
      params: {
        semester_id: semester,
        type: typeScore
      }
    })
      .then((res) => {
        if (res.status === 200) {
          const { data } = res.data;
          setDataScore(data);
        } else {
          toast.error(res.data.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

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
        class_id: _class.id
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
      });
  }

  useEffect(() => {
    setLoading(false);
    setData([]);
    setMeta(null);
    if (_class) {
      setSemester(_class.semesters[0]?.id ?? null);
    }
  }, [_class])

  useEffect(() => {
    if (!loading && _class) {
      if (!meta || meta.current_page < meta.last_page) {
        loadData(meta ? meta.current_page + 1 : 1);
      }
    }
  }, [loading, meta, _class])

  useEffect(() => {
    if (semester) {
      loadDataScore();
    }
  }, [_class, semester, typeScore])

  const exportExcel = () => {
    const excelData = [];
    excelData.push(columns.map((col) => col.header));
    data.forEach((row) => {
      const newRow = [];
      let score = null;
      for (let col of columns) {
        if (col.accessorKey) {
          if (row[col.accessorKey]) {
            newRow.push(row[col.accessorKey]);
          } else {
            score = dataScore.find((i) => i.subject_id == col.accessorKey && i.student_id == row.id);
            if (score) {
              newRow.push(score.score);
            } else {
              newRow.push('');
            }
          }
        } else {
          newRow.push('');
        }
      }
      excelData.push(newRow);
    });
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Bảng điểm`);
    XLSX.writeFile(wb, `BangDiem_${_class.name}_${_class.year?.year}.xlsx`);
  }

  const exportPDF = () => {

  }

  if (!_class) return null;

  return (
    <Dialog open={open} onOpenChange={hide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bảng điểm lớp {_class.name} ({_class.year?.year})</DialogTitle>
        </DialogHeader>
        <div className="flex items-center">
          <Selector 
            className="mr-2"
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
          <Selector 
            className="mr-auto"
            placeholder="Loại điểm"
            defaultValue={typeScore}
            options={typeScores}
            index="type"
            label="name"
            valueObject={false}
            onChange={(v) => {
              setTypeScore(v);
            }}
            unselectable={false}
          />
          <Button size="sm" disabled={loading} onClick={exportExcel}>Xuất dữ liệu</Button>
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportExcel}>
                <Table2 />
                <span>Xuất Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF}>
                <FileText />
                <span>Xuất PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
        <Block isBlocking={loading}>
          <Table data={data} columns={columns} columnPining={{left: ['full_name']}} limit={10} tableClassName="max-h-[calc(100vh-250px)] overflow-y-auto" />
        </Block>
      </DialogContent>
    </Dialog>
  );
}