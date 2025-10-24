// pages/Header.tsx
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();
  const isHome = router.pathname === "/";

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-800 shadow-md">
      <div className="flex items-center gap-4">
        {!isHome && (
          <button
            onClick={() => router.back()}
            className="text-white bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            ← Back
          </button>
        )}
        <Link href="/" className="text-2xl font-bold text-purple-400">
          Electroflix
        </Link>
      </div>

      <Link
        href="/account"
        className="text-white bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
      >
        My Account
      </Link>
    </header>
  );
}
