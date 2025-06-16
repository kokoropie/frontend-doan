'use client';

import Selector from "@/components/form/selector";
import Table from "@/components/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Block from "@/components/ui/block";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AppContext } from "@/contexts/app-context";
import { httpGet } from "@/lib/http";
import { BookUser, GraduationCap, Hash } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import CountUp from "react-countup";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default ({ counts, years, year, setYear = () => {} }) => {
  const appContext = useContext(AppContext);
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState(true);
  const [scoreData, setScoreData] = useState([]);
  const avgScore = useMemo(() => {
    return Math.round(subjects.reduce((acc, subject) => acc + subject.score, 0) / subjects.length * 100) / 100
  }, [subjects]);
  const rank = useMemo(() => {
    if (counts && counts.total_students && counts.avg_score && avgScore) {
      return Math.round((1 - avgScore / counts.avg_score) * counts.total_students);
    }
    return 0;
  }, [counts, avgScore])

  const fetchData = () => {
    if (loading || !counts) return;
    setLoading(true);
    httpGet(appContext.getRoute('dashboard.scores', {
      params: {
        year: year
      }
    }))
      .then((res) => {
        if (res.status === 200) {
          const { data } = res.data;
          setSubjects(data);
          setSubject(data[0]?.id ?? null);
        } else {
          toast.error(res.data.message);
        }
      }).finally(() => {
        setLoading(false);
      });
  }

  const fetchCharts = () => {
    setLoadingChart(true);
    httpGet(appContext.getRoute('dashboard.charts'), {
      params: {
        subject: subject
      }
    })
      .then((res) => {
        if (res.status === 200) {
          const { data } = res.data;
          setScoreData(data);
        } else {
          toast.error(res.data.message);
        }
      })
      .finally(() => {
        setLoadingChart(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, [counts, year])

  useEffect(() => {
    if (counts && subject) {
      fetchCharts();
    }
  }, [counts, subject, year]);

  const scoreConfig = {
    value: {
      label: "Điểm trung bình",
      color: "var(--primary)",
    },
  }
  const columnsSubjects = [
    {
      accessorKey: "subject",
      header: "Môn học",
      cell: ({ row }) => (
        <div>{row.getValue("subject")}</div>
      ),
    },
    {
      accessorKey: "score",
      header: "Điểm trung bình",
      cell: ({ row }) => (
        <div>{row.getValue("score")}</div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span>Năm học</span>
        <Selector
          placeholder="Năm học"
          defaultValue={year}
          options={years}
          index="id"
          label="year"
          valueObject={false}
          onChange={(sYear) => {
            setYear(sYear);
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-lg">
                <AvatarFallback><GraduationCap className="size-10" /></AvatarFallback>
              </Avatar>
              <div>
                Lớp <b>{counts?.class?.name}</b>
                <br />
                {counts?.class?.teacher?.full_name}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-lg">
                <AvatarFallback><Hash className="size-10" /></AvatarFallback>
              </Avatar>
              <div>
                Xếp hạng
                <div className="text-2xl"><CountUp end={rank} /> / <CountUp end={counts?.total_students} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-lg">
                <AvatarFallback><BookUser className="size-10" /></AvatarFallback>
              </Avatar>
              <div>
                Điểm trung bình
                <div className="text-2xl"><CountUp end={avgScore} decimals={2} /></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="pb-0">
        <CardContent>
          <CardTitle className="mb-2">Điểm trung bình các môn</CardTitle>
          <Block isBlocking={loading}>
            <Table data={subjects} columns={columnsSubjects} />
          </Block>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CardTitle>Biểu đồ điểm các môn qua từng năm học</CardTitle>
          <Block isBlocking={loadingChart}>
            <ChartContainer config={scoreConfig} className="mt-4">
              <AreaChart accessibilityLayer data={scoreData}>
                <CartesianGrid />
                <XAxis dataKey="key" tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 10]} hide={true} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Area 
                  dataKey="value" 
                  type="linear" 
                  dot 
                  label={({ x, y, value, offset, viewBox }) => {
                    let anchor = 'middle';
                    if (x === offset) anchor = 'start';
                    else if (x === viewBox.x) anchor = 'end';

                    return <text x={x} y={y - 10} textAnchor={anchor}>{value}</text>
                  }}
                  color="var(--color-value)" 
                  strokeWidth={2} 
                  fill="var(--color-value)" 
                  fillOpacity={0.4} 
                  max={10}
                  />
              </AreaChart>
            </ChartContainer>
          </Block>
          <CardFooter className="pr-0">
            <Selector 
              className="mr-auto"
              placeholder="Môn học"
              align="left"
              defaultValue={subject}
              options={subjects}
              index="id"
              label="subject"
              valueObject={false}
              onChange={(s) => {
                setSubject(s);
              }}
            />
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}