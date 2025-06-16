'use client';

import { AppContext } from "@/contexts/app-context";
import { useContext } from "react";
import TeacherSection from "./teacher-section";
import ParentSection from "./parent-section";

export default () => {
  const appContext = useContext(AppContext);

  if (appContext.loading) {
    return <div className="flex items-center justify-center w-full h-full">Loading...</div>;
  }

  if (appContext.hasRole('teacher')) {
    return <TeacherSection />;
  }

  if (appContext.hasRole('parent')) {
    return <ParentSection />;
  }

  return <div className="flex items-center justify-center w-full h-full">Loading...</div>; 
}