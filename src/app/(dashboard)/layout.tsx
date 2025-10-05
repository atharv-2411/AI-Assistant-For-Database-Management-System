"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Home } from "lucide-react";
import Logo from "@/components/logo";

function Layout({
  children
}: {
  children: React.ReactNode,
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  return (
    <div className="w-screen h-screen relative flex flex-col">
      {currentUser && (
        <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Logo />
              <button
                onClick={() => router.push("/")}
                className="text-gray-300 hover:text-white flex items-center gap-2"
              >
                <Home size={16} />
                Dashboard
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white">Welcome, {currentUser.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </nav>
      )}
      { children }
    </div>
  );
}

export default Layout;