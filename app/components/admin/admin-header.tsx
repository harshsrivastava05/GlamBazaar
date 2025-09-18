"use client";

import { useSession } from "next-auth/react";
import { Menu, Gem } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-background border-b px-4 py-3 flex items-center justify-between md:hidden">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-2">
          <Gem className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold">GlamBazar</span>
        </div>
      </div>

      <Avatar className="h-8 w-8">
        <AvatarImage src={session?.user?.image || ""} />
        <AvatarFallback>
          {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
