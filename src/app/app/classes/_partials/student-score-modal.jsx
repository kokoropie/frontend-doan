'use client';
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { httpGet } from "@/lib/http";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppContext } from "@/contexts/app-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InputScore from "./input-score";
import * as XLSX from "xlsx";

export default ({ open = false, hide = () => { }, _class = null, student = null }) => {
  const appContext = useContext(AppContext);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  const typeScores = {
    'other': 'Khác',
    'short_test': '15 phút',
    'long_test': '45 phút',
    'midterm': 'Giữa kỳ',
    'final': 'Cuối kỳ'
  };
  const limitScores = {
    'other': {
      'max': 5,
      'multi': 1
    },
    'short_test': {
      'max': 3,
      'multi': 1
    },
    'long_test': {
      'max': 2,
      'multi': 1
    },
    'midterm': {
      'max': 1,
      'multi': 2
    },
    'final': {
      'max': 1,
      'multi': 3
    }
  }

  const [subjects, setSubjects] = useState([]);

  const columnsScores = useMemo(() => {
    const columns = [
      {
        accessorKey: "subject",
        header: "Môn học",
        cell: ({ row }) => (
          <div>{row.getValue("subject").name}</div>
        ),
      }
    ];
    Object.keys(typeScores).forEach((type) => {
      columns.push({
        accessorKey: type,
        header: typeScores[type],
        cell: ({ row }) => (
          <div>{row.getValue(type)?.map(i => i.score).join(' | ')}</div>
        ),
      });
    });
    columns.push({
      accessorKey: "average",
      header: "Trung bình",
      cell: ({ row }) => (
        <div>{row.getValue("average")}</div>
      ),
    });
    return columns;
  }, [typeScores]);

  const dataScores = useMemo(() => {
    const _data = [];
    subjects.forEach((subject) => {
      const row = {
        subject: subject,
        average: '0.00'
      };
      let totalScores = 0;
      let count = 0;
      Object.keys(typeScores).forEach((type) => {
        if (data[subject.id] && data[subject.id][type]) {
          row[type] = [...data[subject.id][type]];
          totalScores += row[type].reduce((sum, score) => sum + parseFloat(score.score), 0) * limitScores[type].multi;
          count += row[type].length * limitScores[type].multi;
        }
      });
      if (count) {
        row.average = (totalScores / count).toFixed(2);
      }
      _data.push(row);
    });
    return _data;
  }, [subjects, data]);

  useEffect(() => {
    if (_class) {
      setLoading(true);
      setSubjects([]);
      httpGet(appContext.getRoute('classes.subjects.index', [_class.id]), {
        params: {
          no_relations: 1,
          no_pagination: 1
        }
      }).then((res) => {
        if (res.status === 200) {
          const { data } = res.data.data;
          setSubjects(data);
        } else {
          toast.error(res.data.message);
        }
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [_class]);

  useEffect(() => {
    setData({});
    if (subjects.length && _class && student) {
      setLoading(true);
      httpGet(appContext.getRoute('users.scores.index', [student.id]), {
        params: {
          year: _class.year.id
        }
      }).then((res) => {
        if (res.status === 200) {
          const { data } = res.data;
          setData(data);
        } else {
          toast.error(res.data.message);
        }
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [_class, student, subjects]);
  
  if (!_class || !student) return null;

  return (
    <Dialog open={open} onOpenChange={hide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bảng điểm {student?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center">
          <Button size="sm" disabled={loading} onClick={exportExcel}>Xuất dữ liệu</Button>
        </div>
        <Block isBlocking={loading}>
          <Table data={dataScores} columns={columnsScores} columnPining={{left: ['subject']}} limit={10} tableClassName="max-h-[calc(100vh-250px)] overflow-y-auto" />
        </Block>
      </DialogContent>
    </Dialog>
  );
}