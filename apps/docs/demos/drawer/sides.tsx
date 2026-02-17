"use client";

import { Button } from "keystoneui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "keystoneui/drawer";

const DRAWER_SIDES = [
  { swipeDirection: "up", label: "Top" },
  { swipeDirection: "right", label: "Right" },
  { swipeDirection: "down", label: "Bottom" },
  { swipeDirection: "left", label: "Left" },
] as const;

export default function DrawerSides() {
  return (
    <div className="flex flex-wrap gap-2">
      {DRAWER_SIDES.map((side) => (
        <Drawer key={side.swipeDirection} swipeDirection={side.swipeDirection}>
          <DrawerTrigger render={<Button variant="outline" />}>
            {side.label}
          </DrawerTrigger>
          <DrawerContent className="data-[swipe-direction=down]:max-h-[50vh] data-[swipe-direction=up]:max-h-[50vh]">
            <DrawerHeader>
              <DrawerTitle>Drawer from {side.label.toLowerCase()}</DrawerTitle>
              <DrawerDescription>
                This drawer slides in from the {side.label.toLowerCase()} of the
                screen.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose render={<Button variant="outline" />}>
                Cancel
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  );
}
