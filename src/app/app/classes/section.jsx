'use client';

import { useContext, useEffect, useState } from "react";
import ClassesTable from "./classes-table";
import { cn } from "@/lib/utils";
import SubjectTable from "./_partials/subject-table";
import { AppContext } from "@/contexts/app-context";
import StudentTable from "./_partials/student-table";

export default () => {
  const { loading } = useContext(AppContext);
  const [_class, setClass] = useState(null);
  const [view, setView] = useState('');

  useEffect(() => {
    if (!_class) {
      setView('');
    }
  }, [_class]);

  if (loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  return (
    <div className="flex items-start w-full gap-4 relative">
      <ClassesTable _class={_class} setClass={setClass} view={view} setView={setView} />
      {view === 'subjects' && <SubjectTable _class={_class} setClass={setClass} />}
      {view === 'students' && <StudentTable _class={_class} setClass={setClass} />}
    </div>
  );
}