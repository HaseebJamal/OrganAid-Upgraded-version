import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

import PublicNav from "../components/mycomponents/PublicNav";
import PublicFooter from "../components/mycomponents/PublicFooter";

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <PublicNav />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}