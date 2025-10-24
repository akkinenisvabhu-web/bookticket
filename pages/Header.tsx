import { useRouter } from "next/router";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-md">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded font-semibold"
      >
        Back
      </button>

      {/* Electroflix clickable title */}
      <Link href="/">
        <h1 className="text-2xl font-bold text-purple-400 hover:text-yellow-400 cursor-pointer">
          Electroflix
        </h1>
      </Link>

      {/* Placeholder for spacing */}
      <div className="w-16" />
    </header>
  );
}
