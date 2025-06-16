import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }) {
  return (
    <>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-4 relative">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}