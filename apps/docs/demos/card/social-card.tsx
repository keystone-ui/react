"use client";

import { Avatar, AvatarFallback, AvatarImage } from "keystoneui/avatar";
import { Button } from "keystoneui/button";
import { Card, CardContent, CardHeader } from "keystoneui/card";
import { BadgeCheckIcon } from "lucide-react";

export default function CardSocialCard() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="flex-row items-center gap-3">
        <Avatar size="lg">
          <AvatarImage alt="shadcn" src="https://github.com/shadcn.png" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1 font-semibold text-sm leading-tight">
            shadcn
            <BadgeCheckIcon className="size-4 fill-blue-500 text-white" />
          </div>
          <p className="text-muted-foreground text-xs">@shadcn</p>
        </div>
        <Button size="sm">Follow</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">
          Building open source tools for the web. Creator of shadcn/ui and
          taxonomy.
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <span className="font-semibold">4</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </span>
          <span>
            <span className="font-semibold">97.1K</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
