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

export default function DrawerScrollable() {
  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger render={<Button variant="outline" />}>
        Scrollable Drawer
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Terms of Service</DrawerTitle>
          <DrawerDescription>
            Please review the following terms carefully.
          </DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static demo list
            <p className="mb-4 leading-normal" key={`paragraph-${index}`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <Button>Accept</Button>
          <DrawerClose render={<Button variant="outline" />}>
            Decline
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
