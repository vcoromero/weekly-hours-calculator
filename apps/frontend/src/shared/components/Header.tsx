import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./ui/button";
import { Clock, Users, LogOut } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="flex h-14 items-center justify-between px-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-primary"
          >
            <Clock className="h-5 w-5" />
            <span className="hidden sm:inline">Weekly Hours</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/workers">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-1" />
              Trabajadores
            </Button>
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
