import React from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Home,
  Video,
  Database,
  Settings,
  LogOut,
  Bot,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Home",
      icon: <Home size={20} />,
      path: "/dashboard",
    },
    {
      name: "Interviews",
      icon: <Video size={20} />,
      path: "/setup",
    },
    {
      name: "Question Bank",
      icon: <Database size={20} />,
      path: "/questions",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
    },
    {
      name: "Logout",
      icon: <LogOut size={20} />,
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="bg-surface h-screen w-64 fixed left-0 top-0 border-r border-border hidden md:flex flex-col p-6 z-20 text-text-main">

      {/* Logo */}
      <div className="mb-8 border-b border-border pb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-[4px] flex items-center justify-center shrink-0 shadow-sm">
          <Bot size={20} className="text-white" />
        </div>

        <span className="font-bold tracking-tight text-lg uppercase">
          AI Simulator
        </span>
      </div>

      {/* Navigation */}
      <ul className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive =
            item.path &&
            location.pathname === item.path;

          if (item.onClick) {
            return (
              <li key={item.name}>
                <button
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-[4px] text-sm font-semibold text-text-muted hover:bg-red-50 hover:text-red-600 transition-all duration-100"
                >
                  {React.cloneElement(
                    item.icon as React.ReactElement,
                    { size: 18 }
                  )}

                  {item.name}
                </button>
              </li>
            );
          }

          return (
            <li key={item.name}>
              <Link
                to={item.path!}
                className={`flex items-center gap-3 px-4 py-2 rounded-[4px] text-sm font-semibold transition-all duration-100 ${
                  isActive
                    ? "text-primary bg-background border border-primary shadow-sm"
                    : "text-text-muted hover:bg-surface-muted"
                }`}
              >
                {React.cloneElement(
                  item.icon as React.ReactElement,
                  { size: 18 }
                )}

                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User Profile */}
      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-4">

        <div className="flex items-center gap-3 p-2 border border-border rounded-[4px] bg-background shadow-sm relative group">

          {/* Profile Image */}
          <div className="w-8 h-8 bg-primary/10 text-primary font-bold rounded-[4px] overflow-hidden flex-shrink-0 border border-primary/20 flex items-center justify-center text-xs uppercase">
            {user?.name ? user.name.charAt(0) : "U"}
          </div>

          {/* User Information */}
          <div className="flex-1 min-w-0">

            <p className="text-xs font-bold text-text-main truncate uppercase tracking-tight">
              {user?.name || "User"}
            </p>

            <p className="text-[10px] text-text-muted truncate font-medium">
              {user?.email || ""}
            </p>

          </div>

          {/* Logout Icon */}
          <button
            onClick={handleLogout}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 text-red-600 rounded-[4px] absolute right-2 bg-white border border-border"
            title="Logout"
          >
            <LogOut size={14} />
          </button>

        </div>

      </div>

    </nav>
  );
}