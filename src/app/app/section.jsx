'use client';

import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/contexts/app-context";
import AdminDashboard from "./_partials/AdminDashboard";
import TeacherDashboard from "./_partials/TeacherDashboard";
import StudentDashboard from "./_partials/StudentDashboard";
import ParentDashboard from "./_partials/ParentDashboard";
import { httpGet } from "@/lib/http";
import { toast } from "sonner";

export default () => {
  const appContext = useContext(AppContext);

  const [data, setData] = useState({});
  const [years, setYears] = useState([]);
  const [year, setYear] = useState(null);

  const addData = (key, value) => {
    let newData = { ...data };
    newData[key] = value;
    setData(newData);
  }

  useEffect(() => {
    if (!appContext.loading) {
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
          setYear(data.find(i => i.current)?.id);
        } else {
          toast.error(res.data.message);
        }
      })
    }
  }, [appContext])

  useEffect(() => {
    if (year) {
      httpGet(appContext.getRoute('dashboard.count'), {
        params: {
          year: year
        }
      }).then((response) => {
        if (response.status === 200) {
          addData('counts', response.data.data);
        } else {
          toast.error('Không thể tải dữ liệu');
        }
      }).catch((error) => {
        console.error('Error fetching counts:', error);
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      });
    }
  }, [year])

  if (appContext.loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  if (appContext.hasRole('admin')) {
    return <AdminDashboard {...data} year={year} setYear={setYear} years={years} />
  }
  if (appContext.hasRole('teacher')) {
    return <TeacherDashboard {...data} year={year} setYear={setYear} years={years} />
  }
  if (appContext.hasRole('student')) {
    return <StudentDashboard {...data} year={year} setYear={setYear} years={years} />
  }
  if (appContext.hasRole('parent')) {
    return <ParentDashboard {...data} year={year} setYear={setYear} years={years} />
  }
  return <div className="flex items-center justify-center w-full h-full">Loading...</div>
}