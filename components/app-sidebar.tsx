"use client"

import * as React from "react"
import {
  BookOpen,
  PlusCircle,
  Home
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            食谱管理
          </h2>
          <div className="space-y-1">

            <Button
              variant={pathname === "/recipe-binders" ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/recipe-binders">
                <BookOpen className="mr-2 h-4 w-4" />
                我的食谱夹
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}