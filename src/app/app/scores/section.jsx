'use client';

import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "@/contexts/app-context";
import Selector from "@/components/form/selector";
import Table from "@/components/table";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { httpGet } from "@/lib/http";
import Block from "@/components/ui/block";

export default () => {
  const appContext = useContext(AppContext);

  const [_class, setClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

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
        const rank = data[subject.id + '_avg'] ? Math.round((1 - row.average / data[subject.id + '_avg']) * _class.students_count) : 0
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
      httpGet(appContext.getRoute('classes.index'), {
        params: {
          no_relations: 1,
          no_pagination: 1,
          year: year.id,
          count: ['students']
        }
      }).then((res) => {
        if (res.status === 200) {
          const { data } = res.data.data;
          setClass(data[0]);
        } else {
          toast.error(res.data.message);
        }
      })
    }
  }, [year]);

  useEffect(() => {
    if (_class && year) {
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
  }, [_class, year]);

  useEffect(() => {
    setData({});
    if (subjects.length && year) {
      setLoading(true);
      httpGet(appContext.getRoute('users.scores.index', [appContext.user.id]), {
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
        <span>Lớp {_class?.name}</span>
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
    </div>
  );
}