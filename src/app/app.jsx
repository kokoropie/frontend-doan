'use client';
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CookiesProvider } from "react-cookie";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@/contexts/app-context";

const queryClient = new QueryClient();

export default function App({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    nProgress.start();
    setTimeout(() => {
      nProgress.done();
    }, 500);
    return () => {
      nProgress.done();
    };
  }, [pathname]);

  return (
    <AppProvider>
      <CookiesProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors />
        </QueryClientProvider>
      </CookiesProvider>
    </AppProvider>
  )
};