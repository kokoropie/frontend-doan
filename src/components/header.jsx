'use client'

import { ArrowRightFromLine, Grip } from "lucide-react";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [title, setTitle] = useState("Edu Score Manager");
  const pathname = usePathname();
  const sidebar = useSidebar();

  useEffect(() => {
    setTitle(document.title);
  }, [pathname])

  return (
    <header className="flex h-16 shrink-0 items-center px-4 gap-2 sticky top-0 z-[5] bg-background shadow transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <SidebarTrigger className="-ml-1 size-10 text-primary hover:text-primary">
        {(sidebar.open || sidebar.isMobile) && <Grip className="size-8" />}
        {!(sidebar.open || sidebar.isMobile) && <ArrowRightFromLine className="size-8" />}
      </SidebarTrigger>
      <div className="text-2xl font-bold">{title}</div>
    </header>
  )
}