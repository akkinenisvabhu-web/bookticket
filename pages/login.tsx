// pages/login.tsx
import { useState, useEffect } from "react";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");

  // Check if already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      if (usr) {
        setUser(usr);
        router.push("/"); // redirect to home
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // redirect after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
      router.push("/"); // redirect after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (user) return <p className="text-center mt-20">Redirecting...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      {error && (
        <p className="bg-red-600 p-2 rounded mb-4 text-center">{error}</p>
      )}

      <form
        onSubmit={handleEmailLogin}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded bg-gray-800 text-white focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-gray-800 text-white focus:outline-none"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 p-3 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>

      <div className="my-4">OR</div>

      <button
        onClick={handleGoogleLogin}
        className="bg-red-600 p-3 rounded hover:bg-red-700 transition"
      >
        Login with Google
      </button>

      <p className="mt-4">
        Don’t have an account?{" "}
        <a href="/signup" className="underline text-blue-400">
          Sign Up
        </a>
      </p>
    </div>
  );
}
