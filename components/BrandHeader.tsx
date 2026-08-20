import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";

/** Top navigation shown on the public pages (/, /login, /signup). */
export default function BrandHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold"
          style={{ color: brand.primaryColor }}
        >
          <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
          {brand.name}
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="pg-gradient-btn rounded-lg px-4 py-1.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
