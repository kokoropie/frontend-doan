'use client';

import { useContext, useEffect, useState } from "react";
import SubjectsTable from "./subjects-table";
import { cn } from "@/lib/utils";
import { AppContext } from "@/contexts/app-context";

export default () => {
  const { loading } = useContext(AppContext);
  const [subject, setSubject] = useState(null);

  if (loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>
  }

  return (
    <div className="flex items-start w-full gap-4 relative">
      <SubjectsTable subject={subject} setSubject={setSubject} />
    </div>
  );
}