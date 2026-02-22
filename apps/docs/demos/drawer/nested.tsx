"use client";

import { Button } from "@keystoneui/react/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystoneui/react/drawer";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function DrawerNested() {
  const [goal, setGoal] = useState(350);

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)));
  }

  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Move Goal
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                className="h-8 w-8 shrink-0 rounded-full"
                disabled={goal <= 200}
                onClick={() => onClick(-10)}
                size="icon"
                variant="outline"
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="font-bold text-7xl tracking-tighter">
                  {goal}
                </div>
                <div className="text-[0.70rem] text-muted-foreground uppercase">
                  Calories/day
                </div>
              </div>
              <Button
                className="h-8 w-8 shrink-0 rounded-full"
                disabled={goal >= 400}
                onClick={() => onClick(10)}
                size="icon"
                variant="outline"
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
