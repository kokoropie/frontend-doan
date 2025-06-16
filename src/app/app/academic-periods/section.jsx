'use client';

import { useContext, useEffect, useState } from "react";
import SemestersTable from "./_partials/semesters-table";
import YearsTable from "./years-table";
import { cn } from "@/lib/utils";
import { AppContext } from "@/contexts/app-context";

export default () => {
  const { loading } = useContext(AppContext);
  const [year, setYear] = useState(null);
  const [view, setView] = useState('');

  useEffect(() => {
    if (!year) {
      setView('');
    }
  }, [year]);

  if (loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  return (
    <div className="flex items-start w-full gap-4 relative">
      <YearsTable year={year} setYear={setYear} view={view} setView={setView} />
      {view === 'semesters' && <SemestersTable year={year} setYear={setYear} />}
    </div>
  );
}