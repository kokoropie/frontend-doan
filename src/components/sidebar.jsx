'use client'

import { Sidebar as SidebarBase, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { intialName } from "@/lib/utils";
import { Blocks, BookCopy, BookPlus, BookUser, Calendar, ChevronsUpDown, Gauge, GraduationCap, LogOut, MessageCircle, MessagesSquare, Plus, Send, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarItem from "./sidebar/item";
import { useContext } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import nProgress from "nprogress";
import { AppContext } from "@/contexts/app-context";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function Sidebar({ ...props }) {
  const pathname = usePathname();
  const appContext = useContext(AppContext);

  return (
    <SidebarBase collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/app" className="flex items-center justify-center group-data-[collapsible=icon]:h-auto">
                <div className="inline-flex items-center justify-center font-extrabold size-10 group-data-[collapsible=icon]:text-xs group-data-[collapsible=icon]:size-8 text-white bg-primary rounded-lg mr-0.5">ESM</div>
                <div className="font-bold text-primary bg-white border-primary border rounded-lg px-3 py-0.5 group-data-[collapsible=icon]:hidden whitespace-nowrap">Edu Score Manager</div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Dashboard */}
          <SidebarItem title="Thống kê" icon={Gauge} href="/app" isActive={pathname === '/app'} hide={!appContext.user || (appContext.user && appContext.hasRole('parent'))} />
          {appContext.user && <>
            {/* Academic Periods */}
            <SidebarItem title="Năm học" icon={Calendar} href="/app/academic-periods" isActive={pathname.startsWith('/app/academic-periods')} hide={!appContext.hasRole('admin', 'teacher')} />
            {/* Classes */}
            <SidebarItem title="Lớp" icon={Blocks} href="/app/classes" isActive={pathname.startsWith('/app/classes')} hide={appContext.hasRole('parent', 'student')} />
            {/* Subjects */}
            <SidebarItem title="Môn học" icon={BookCopy} href="/app/subjects" isActive={pathname.startsWith('/app/subjects')} hide={!appContext.hasRole('admin')} />
            {/* Teachers */}
            <SidebarItem title="Giáo viên" icon={Users} href="/app/teachers" isActive={pathname.startsWith('/app/teachers')} hide={!appContext.hasRole('admin')} />
            {/* Students */}
            <SidebarItem title="Học sinh" icon={GraduationCap} href="/app/students" isActive={pathname.startsWith('/app/students')} hide={!appContext.hasRole('admin')} />
            {/* Scores */}
            <SidebarItem title="Điểm" href="/app/scores" icon={BookUser} isActive={pathname.startsWith('/app/scores')} hide={!appContext.hasRole('student')} />
            {/* Childen */}
            <SidebarItem title="Con" icon={Users} href="/app/children" isActive={pathname.startsWith('/app/children')} hide={!appContext.hasRole('parent')} />
            {/* Parent */}
            <SidebarItem title="Phụ huynh" icon={Users} href="/app/parents" isActive={pathname.startsWith('/app/parents')}  hide={!appContext.hasRole('admin')} />
            {/* Feedback */}
            <SidebarItem title="Phản hồi" icon={MessagesSquare} href="/app/feedback" isActive={pathname.startsWith('/app/feedback')} hide={!appContext.hasRole('parent', 'teacher')} />
          </>}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {appContext.user && <SidebarMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={appContext.user.avatar} alt={appContext.user.full_name} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">{intialName(appContext.user.full_name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{appContext.user.full_name}</span>
                  <span className="truncate text-xs">{appContext.user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={Sidebar.isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={appContext.user.avatar} alt={appContext.user.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">{intialName(appContext.user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{appContext.user.full_name}</span>
                    <span className="truncate text-xs">{appContext.user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {appContext.hasRole('admin', 'teacher') && <DropdownMenuItem asChild>
                <Button onClick={(() => nProgress.start())}>
                  <Send />
                  Gửi thông báo
                </Button>
              </DropdownMenuItem>}
              {!appContext.hasRole('admin') && <DropdownMenuItem asChild>
                <Button onClick={(() => nProgress.start())}>
                  <MessageCircle />
                  Thông báo
                  {appContext.user?.received_notifications_count && <Badge className="ml-1" variant="destructive">{ appContext.user?.received_notifications_count }</Badge>}
                </Button>
              </DropdownMenuItem>}
              <DropdownMenuItem asChild>
                <Link href={'/auth/logout'} onClick={(() => nProgress.start())}>
                  <LogOut />
                  Đăng xuất
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenu>}
      </SidebarFooter>
      <SidebarRail />
    </SidebarBase>
  )
}