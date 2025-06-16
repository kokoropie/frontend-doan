'use client';

import { useContext, useEffect, useState } from "react";
import ParentsTable from "./parents-table";
import { cn } from "@/lib/utils";
import { AppContext } from "@/contexts/app-context";
import StudentTable from "./_partials/student-table";

export default () => {
  const { loading } = useContext(AppContext);
  const [parent, setParent] = useState(null);
  const [view, setView] = useState('');

  useEffect(() => {
    if (!parent) {
      setView('');
    }
  }, [parent]);

  if (loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  return (
    <div className="flex items-start w-full gap-4 relative">
      <ParentsTable parent={parent} setParent={setParent} view={view} setView={setView} />
      {view === 'children' && parent && <StudentTable parent={parent} setParent={setParent} />}
    </div>
  );
}