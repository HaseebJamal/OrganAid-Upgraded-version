import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/admin/Navbar";
import Sidebar from "../components/admin/Sidebar";

export default function AdminLayout() {
  const location = useLocation();
  const mainContentRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  useEffect(() => {
    if (!isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    mainContentRef.current?.focus({
      preventScroll: true,
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <Sidebar
        mobile
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <div className="min-h-screen lg:pl-72">
        <Navbar
          onOpenSidebar={openSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main
          ref={mainContentRef}
          id="admin-main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}