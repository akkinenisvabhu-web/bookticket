import { useState } from "react";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Sign up successful!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/account"); // redirect after login/signup
    } catch (err: any) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">{isSignup ? "Sign Up" : "Login"}</h1>
      
      <input
        type="email"
        placeholder="Email"
        className="mb-3 p-2 rounded text-black w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-3 p-2 rounded text-black w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="w-64 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold mb-3"
      >
        {isSignup ? "Sign Up" : "Login"}
      </button>

      <p className="text-gray-400">
        {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="text-purple-400 underline"
        >
          {isSignup ? "Login" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
