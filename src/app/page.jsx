import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center justify-center font-extrabold size-12 bg-primary text-white rounded-lg text-lg mr-2">ESM</div>
          <div className="font-bold text-2xl text-primary bg-white rounded-lg border-primary border px-3">Edu Score Manager</div>
        </div>
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.js
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full group border border-solid border-transparent transition-colors flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary-foreground hover:text-primary hover:border-primary gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/app"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 20"><path fill="currentColor" d="M1 11v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v6h8V5l4.75 5L9 15v-4z"></path></svg>
            Start now
          </Link>
        </div>
      </main>
    </div>
  );
}
