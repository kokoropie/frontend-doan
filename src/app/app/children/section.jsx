'use client';

import Selector from "@/components/form/selector";
import Table from "@/components/table";
import Block from "@/components/ui/block";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { AppContext } from "@/contexts/app-context";
import { httpGet } from "@/lib/http";
import { Send } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import FeedbackModel from "./_partials/feedback-model";

export default () => {
  const appContext = useContext(AppContext);

  const [kid, setKid] = useState(null);
  const [listKids, setListKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [score, setScore] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (sScore) => {
    setScore(sScore);
    setOpen(true);
  }

  const [year, setYear] = useState(null);
  const [listYears, setListYears] = useState([]);

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
    columns.push({
      accessorKey: "rank",
      header: "Xếp hạng",
      cell: ({ row }) => (
        <div>{row.getValue("rank")}</div>
      ),
    });
    columns.push({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="size-6" onClick={() => handleOpen(row.original)}>
            <span className="sr-only">Phản hồi</span>
            <Send className="size-4"  />
          </Button>
        </div>
      ),
    })
    return columns;
  }, [typeScores]);

  const dataScores = useMemo(() => {
    const _data = [];
    subjects.forEach((subject) => {
      const row = {
        subject: subject,
        average: '0.00',
        rank: 0,
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
        const rank = data[subject.id + '_avg'] ? Math.round((1 - row.average / data[subject.id + '_avg']) * kid.class_year.students_count) : 0
        row.rank = rank < 0 ? 1 : rank
      }
      _data.push(row);
    });
    return _data;
  }, [subjects, data]);

  useEffect(() => {
    if (appContext.loading) {
      return;
    }
    httpGet(appContext.getRoute('academic-years.index'), {
      params: {
        no_relations: 1,
        no_pagination: 1
      }
    }).then((res) => {
      if (res.status === 200) {
        const { data } = res.data.data;
        setListYears(data);
        setYear(data.length > 0 ? data[0] : null);
      } else {
        toast.error(res.data.message);
      }
    })
  }, [appContext.loading]);

  useEffect(() => {
    if (year) {
      httpGet(appContext.getRoute('users.index'), {
        params: {
          no_relations: 1,
          no_pagination: 1,
          sort_by: ['first_name', 'last_name'],
          sort: ['asc', 'asc'],
          roles: 'student',
          parent_id: appContext.user.id,
          with: ['classYear.scores'],
          year: year.id
        }
      }).then((res) => {
        if (res.status === 200) {
          const { data } = res.data.data;
          setListKids(data);
          setKid(data.length > 0 ? data[0] : null);
        } else {
          toast.error(res.data.message);
        }
      })
    }
  }, [year]);

  useEffect(() => {
    if (kid && year) {
      setLoading(true);
      setSubjects([]);
      httpGet(appContext.getRoute('classes.subjects.index', [kid.class_year.id]), {
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
  }, [kid, year]);

  useEffect(() => {
    setData({});
    if (subjects.length && year) {
      setLoading(true);
      httpGet(appContext.getRoute('users.scores.index', [kid.id]), {
        params: {
          year: year.id
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
  }, [year, subjects]);

  if (appContext.loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Selector
          placeholder="Chọn"
          defaultValue={kid}
          options={listKids}
          index="id"
          label="full_name"
          onChange={(sKid) => {
            setKid(sKid);
          }}
          unselectable={false}
        />
        <span>Lớp {kid?.class_year?.name}</span>
      </div>
      <Card>
        <CardContent>
          <CardTitle>Bảng điểm</CardTitle>
          <Block isBlocking={loading}>
            <Table data={dataScores} columns={columnsScores} />
          </Block>
          <CardFooter className="border-t">
            <span>Năm học</span>
            <Selector
              className="ml-2"
              placeholder="Năm học"
              defaultValue={year}
              options={listYears}
              index="id"
              label="year"
              onChange={(sYear) => {
                setYear(sYear);
              }}
              unselectable={false}
            />
          </CardFooter>
        </CardContent>
      </Card>
      <FeedbackModel open={open && score} hide={() => {
        setOpen(false);
        setScore(null);
      }} score={score} onSuccess={() => {
        setOpen(false);
        setScore(null);
      }} />
    </div>
  );
}