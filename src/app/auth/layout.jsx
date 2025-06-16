import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import AuthBg from '@/assets/images/auth-bg.jpg';
import AuthImage from '@/assets/images/auth-image.png';
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full container max-w-5xl">
        <Card className="overflow-hidden h-[80vh] py-0">
          <CardContent className="grid p-0 md:grid-cols-2 h-full items-center">
            <div className="relative hidden bg-muted md:block md:h-full">
              <Image
                src={AuthBg}
                alt="Image"
                fill
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
              <div className="absolute inset-0 h-full w-full">
                <div className="w-full my-12">
                  <Link href="/" className="flex items-center justify-center">
                    <div className="inline-flex items-center justify-center font-extrabold size-12 bg-primary text-white rounded-lg text-lg mr-2">ESM</div>
                    <div className="font-bold text-2xl text-primary bg-white rounded-lg border-primary border px-3">Edu Score Manager</div>
                  </Link>
                </div>
                  <Image src={AuthImage} alt="Image" fill className="!top-[calc(50%_+_2rem)] !w-[80%] !h-auto mx-auto animate-[5s_ease_0s_normal_none_infinite_running_auth-slideskew]" />
              </div>
            </div>
            <div>
              <div className="inset-0 w-full min-md:hidden">
                <Link href="/" className="flex items-center justify-center">
                  <div className="inline-flex items-center justify-center font-extrabold size-12 bg-primary text-white rounded-lg text-lg mr-2">ESM</div>
                  <div className="font-bold text-2xl text-primary bg-white rounded-lg border-primary border px-3 max-sm:hidden">Edu Score Manager</div>
                </Link>
              </div>
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
