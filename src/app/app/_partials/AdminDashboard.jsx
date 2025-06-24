'use client';

import Selector from "@/components/form/selector";
import Table from "@/components/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AppContext } from "@/contexts/app-context";
import { httpGet } from "@/lib/http";
import { GraduationCap, MessagesSquare, Users } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import CountUp from "react-countup";
import { Area, AreaChart, CartesianAxis, CartesianGrid, XAxis, YAxis } from "recharts";

export default ({ counts }) => {
  const appContext = useContext(AppContext);

  const [yearData, setYearData] = useState([]);
  const yearConfig = {
    value: {
      label: "Số học sinh",
      color: "var(--primary)",
    },
  }
  const [feedbackData, setFeedbackData] = useState([])
  const feedbackConfig = {
    value: {
      label: "Số phản hồi",
      color: "var(--primary)",
    },
  }
  const [year, setYear] = useState(2025);
  const listYears = [
    { id: 2021 },
    { id: 2022 },
    { id: 2023 },
    { id: 2024 },
    { id: 2025 }
  ];

  const [yearTop, setYearTop] = useState(1);
  const listYearsTop = [
    { id: 4, label: "2021 - 2022" },
    { id: 3, label: "2022 - 2023" },
    { id: 2, label: "2023 - 2024" },
    { id: 1, label: "2024 - 2025" },
  ];
  const columnsYearTop = [
    {
      accessorKey: "full_name",
      header: "Họ và tên",
      cell: ({ row }) => (
        <div>{row.getValue("full_name")}</div>
      ),
    },
    {
      accessorKey: "class_name",
      header: "Lớp",
      cell: ({ row }) => (
        <div>{row.getValue("class_name")}</div>
      ),
    },
    {
      accessorKey: "score",
      header: "Điểm",
      cell: ({ row }) => (
        <div>{row.getValue("score")}</div>
      ),
    },
  ];
  const [dataYearTop, setDataYearTop] = useState([]);
  
  const fetchTopStudents = async () => {
    httpGet(appContext.getRoute('dashboard.top-score'))
      .then((response) => {
        if (response.data) {
          setDataYearTop(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching top students:", error);
      });
  };
  const fetchYearData = async () => {
    httpGet(appContext.getRoute('dashboard.students'))
      .then((response) => {
        if (response.data) {
          setYearData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching chart students:", error);
      });
  }
  const fetchFeedbackData = async () => {
    httpGet(appContext.getRoute('dashboard.feedback'), { params: { year } })
      .then((response) => {
        if (response.data) {
          setFeedbackData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching feedback data:", error);
      });
  }

  useEffect(() => {
    fetchTopStudents();
    fetchYearData();
  }, [])

  useEffect(() => {
    fetchFeedbackData();
  }, [year])

  return <div className="space-y-3">
    <div className="grid grid-cols-5 gap-3">
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarFallback><Users className="size-10" /></AvatarFallback>
            </Avatar>
            <div>
              Tổng số giáo viên
              <div className="text-2xl"><CountUp end={counts?.teachers ?? 0} /></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarFallback><GraduationCap className="size-10" /></AvatarFallback>
            </Avatar>
            <div>
              Tổng số học sinh
              <div className="text-2xl"><CountUp end={counts?.students ?? 0} /></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarFallback><Users className="size-10" /></AvatarFallback>
            </Avatar>
            <div>
              Tổng số phụ huynh
              <div className="text-2xl"><CountUp end={counts?.parents ?? 0} /></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarFallback><MessagesSquare className="size-10" /></AvatarFallback>
            </Avatar>
            <div>
              Tổng số thông báo
              <div className="text-2xl"><CountUp end={counts?.notifications ?? 0} /></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-lg">
              <AvatarFallback><MessagesSquare className="size-10" /></AvatarFallback>
            </Avatar>
            <div>
              Tổng số phản hồi
              <div className="text-2xl"><CountUp end={counts?.feedback ?? 0} /></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent>
          <CardTitle>Thống kê số học sinh theo học từng năm</CardTitle>
          <ChartContainer config={yearConfig} className="mt-4">
            <AreaChart data={yearData}>
              <CartesianGrid />
              <XAxis dataKey="key" tickLine={false} axisLine={false} interval="preserveStartEnd" />
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
                />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <CardTitle>Thống kê số phản hồi/góp ý theo tháng</CardTitle>
          <ChartContainer config={feedbackConfig} className="mt-4">
            <AreaChart accessibilityLayer data={feedbackData}>
              <CartesianGrid />
              <XAxis dataKey="key" tickLine={false} axisLine={false} interval="preserveStartEnd" />
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
                />
            </AreaChart>
          </ChartContainer>
          <CardFooter className="pr-0">
            <div className="text-xs text-muted-foreground">Số phản hồi được thống kê từ tháng 1 đến tháng 12</div>
            <Selector 
              className="ml-auto"
              placeholder="Năm"
              align="left"
              defaultValue={year}
              options={listYears}
              index="id"
              label="id"
              valueObject={false}
              onChange={(sYear) => {
                setYear(sYear);
              }}
            />
          </CardFooter>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardContent>
        <CardTitle>Top trung bình môn toàn trường</CardTitle>
        <Table data={dataYearTop} columns={columnsYearTop} isSelectingRow={false} paginationDisabled className="mt-3" />
        <CardFooter className="border-t">
          <Selector 
            placeholder="Năm học"
            align="left"
            defaultValue={yearTop}
            options={listYearsTop}
            index="id"
            label="label"
            valueObject={false}
            onChange={(sYear) => {
              setYearTop(sYear);
            }}
          />
        </CardFooter>
      </CardContent>
    </Card>
  </div>
}