"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { Badge } from "@keystoneui/react/badge";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressTrack,
} from "@keystoneui/react/circular-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@keystoneui/react/progress";
import { Separator } from "@keystoneui/react/separator";
import {
  ChevronRight,
  Gift,
  Headset,
  LogOut,
  Settings,
  Star,
  Trophy,
  Wallet,
} from "lucide-react";

function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative cursor-pointer" type="button">
          <CircularProgress className="size-13" color="default" value={42}>
            <CircularProgressTrack />
            <CircularProgressIndicator />
            <Avatar className="relative" size="lg">
              <AvatarImage
                alt="User"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="absolute right-0 bottom-0 z-10 inline-flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground ring-2 ring-background">
              7
            </span>
          </CircularProgress>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="rounded-md bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage
                alt="User"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">John Doe</span>
                <Badge size="sm" variant="default">
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">$1,250.00</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground text-xs">Lvl</span>
              <span className="font-bold text-lg">7</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">Level 7</span>
            <span className="text-muted-foreground">Level 8</span>
          </div>
          <Progress value={42}>
            <ProgressTrack className="h-1.5">
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
          <p className="mt-1 text-center text-muted-foreground text-xs">
            42% to next level
          </p>
        </div>

        <Separator />

        <div className="py-1">
          {[
            { icon: Wallet, label: "Wallet" },
            { icon: Trophy, label: "Rewards" },
            { icon: Gift, label: "Bonuses" },
            { icon: Star, label: "Points" },
            { icon: Settings, label: "Settings" },
            { icon: Headset, label: "Support" },
          ].map(({ icon: Icon, label }) => (
            <DropdownMenuItem
              className="flex cursor-pointer items-center justify-between"
              key={label}
            >
              <span className="flex items-center gap-3">
                <Icon className="size-4 text-muted-foreground" />
                {label}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </DropdownMenuItem>
          ))}
        </div>

        <Separator />

        <div className="py-1">
          <DropdownMenuItem
            className="flex cursor-pointer items-center justify-center gap-2"
            variant="destructive"
          >
            <LogOut className="size-4" />
            Log Out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProfileDropdown01() {
  return (
    <div className="flex min-h-[400px] items-start justify-center pt-4">
      <ProfileDropdown />
    </div>
  );
}
