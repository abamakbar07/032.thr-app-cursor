import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center mb-8 justify-center">
          <Image
            src="/logo.svg"
            alt="Family Gacha THR App"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">
            Family Gacha THR
          </span>
        </Link>
        
        {children}
      </div>
    </div>
  );
} 