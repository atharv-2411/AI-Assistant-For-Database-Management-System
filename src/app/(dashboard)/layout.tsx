import React from "react";
import Logo from "@/components/logo";

function Layout({
  children
}: {
  children: React.ReactNode,
}) {
  return (
    <div className="w-screen h-screen relative flex flex-col">
      { children }
    </div>
  );
}

export default Layout;