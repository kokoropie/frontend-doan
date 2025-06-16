'use client';

import { useContext, useEffect, useState } from "react";
import StudentsTable from "./students-table";
import { cn } from "@/lib/utils";
import { AppContext } from "@/contexts/app-context";

export default () => {
  const { loading } = useContext(AppContext);
  const [student, setStudent] = useState(null);
  const [view, setView] = useState('');

  useEffect(() => {
    if (!student) {
      setView('');
    }
  }, [student]);

  if (loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  return (
    <div className="flex items-start w-full gap-4 relative">
      <StudentsTable student={student} setStudent={setStudent} view={view} setView={setView} />
    </div>
  );
}