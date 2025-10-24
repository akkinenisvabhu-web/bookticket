// components/Header.tsx
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();

  // Determine if back button should be shown
  const showBackButton = router.pathname !== "/";

  const handleBack = () => {
    // Always go to home if there is no previous page or if current page is login/signup
    if (router.pathname === "/login" || router.pathname === "/signup") {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-800">
      {showBackButton && (
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white font-semibold"
        >
          Back
        </button>
      )}

      <h1
        onClick={() => router.push("/")}
        className="text-2xl font-bold text-purple-400 cursor-pointer"
      >
        Electroflix
      </h1>

      <button
        onClick={() => router.push("/account")}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold text-white"
      >
        My Account
      </button>
    </div>
  );
}
