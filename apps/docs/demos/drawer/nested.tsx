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
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

const SOUNDS = ["Chime", "Pulse", "Bamboo", "None"];

export default function DrawerNested() {
  const [sound, setSound] = useState("Chime");
  const [picking, setPicking] = useState(false);

  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>
        Notifications
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>How new activity reaches you.</DrawerDescription>
          </DrawerHeader>
          {/* A drawer rendered inside another one nests: the one behind steps
              back and peeks out above it. */}
          <Drawer onOpenChange={setPicking} open={picking}>
            <DrawerTrigger className="flex h-12 w-full cursor-pointer items-center justify-between px-4 text-sm">
              <span className="font-medium">Sound</span>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                {sound}
                <ChevronRight className="size-4" />
              </span>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm pb-4">
                <DrawerHeader>
                  <DrawerTitle>Sound</DrawerTitle>
                </DrawerHeader>
                <RadioGroup
                  className="gap-0"
                  onValueChange={(value) => {
                    setSound(value as string);
                    setPicking(false);
                  }}
                  value={sound}
                >
                  {SOUNDS.map((option) => (
                    // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                    <label
                      className="flex h-12 cursor-pointer items-center gap-3 px-4 text-sm"
                      key={option}
                    >
                      <RadioGroupItem value={option} />
                      {option}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </DrawerContent>
          </Drawer>
          <DrawerFooter>
            <DrawerClose render={<Button />}>Done</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
