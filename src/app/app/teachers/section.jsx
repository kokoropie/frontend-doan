'use client';

import { useContext, useEffect, useState } from "react";
import TeachersTable from "./teachers-table";
import { cn } from "@/lib/utils";
import { AppContext } from "@/contexts/app-context";

export default () => {
  const { loading } = useContext(AppContext);
  const [teacher, setTeacher] = useState(null);
  const [view, setView] = useState('');

  useEffect(() => {
    if (!teacher) {
      setView('');
    }
  }, [teacher]);

  if (loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  return (
    <div className="flex items-start w-full gap-4 relative">
      <TeachersTable teacher={teacher} setTeacher={setTeacher} view={view} setView={setView} />
    </div>
  );
}