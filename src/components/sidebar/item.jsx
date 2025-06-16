'use client'

import Link from "next/link";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSubItem, SidebarMenuSubButton, SidebarMenuSub, useSidebar } from "../ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function SidebarItem({title, href = undefined, isActive, submenu = [], hide = false, ...props}) {
  if (hide) return <></>;
  const cloneParent = {
    title: title,
    href: href,
    icon: props.icon,
    submenu: submenu.filter((i) => !i.hide),
  }
  const sidebar = useSidebar();
  const className = cn(
    'rounded-none group-data-[collapsible=icon]:pl-1.5!',
    isActive && 'bg-primary !text-primary-foreground hover:!bg-primary/90'
  );
  if (cloneParent.submenu.length == 1) {
    cloneParent.title = cloneParent.submenu[0].title
    cloneParent.icon = cloneParent.submenu[0].icon
    cloneParent.href = cloneParent.submenu[0].href
    cloneParent.submenu =  []
  }
  if (!cloneParent.submenu.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip={cloneParent.title} asChild>
          <Link href={cloneParent.href} className={className}>
            <cloneParent.icon className="!size-8" />
            <span>{cloneParent.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
  if (sidebar.open || sidebar.isMobile) {
    return (
      <Collapsible asChild defaultOpen={isActive}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton size="lg" tooltip={title} className={className}>
              <props.icon className="!size-8" />
              <span>{title}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {cloneParent.submenu.map((item, index) => !item.hide && <SidebarMenuSubItem key={index}>
                <SidebarMenuSubButton asChild>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>)}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <DropdownMenu>
      <SidebarMenuItem>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton size="lg" tooltip={title} className={className}>
            <props.icon className="!size-8" />
            <span>{title}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={sidebar.isMobile ? "bottom" : "right"}
          align={sidebar.isMobile ? "end" : "start"}
          className="min-w-56 rounded-lg"
        >
          {cloneParent.submenu.map((item, index) => !item.hide && <DropdownMenuItem asChild key={index}>
            <Link href={item.href}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </DropdownMenuItem>)}
        </DropdownMenuContent>
      </SidebarMenuItem>
    </DropdownMenu>
  )
}