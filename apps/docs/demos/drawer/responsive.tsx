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
import { useMediaQuery } from "@keystoneui/react/hooks";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@keystoneui/react/modal";
import { useState } from "react";

function ProfileForm({ className }: React.ComponentProps<"form">) {
  return (
    <form className={`grid items-start gap-4 ${className ?? ""}`}>
      <div className="grid gap-2">
        <Label htmlFor="responsive-email">Email</Label>
        <Input
          defaultValue="user@example.com"
          id="responsive-email"
          type="email"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="responsive-username">Username</Label>
        <Input defaultValue="@keystoneui" id="responsive-username" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}

export default function DrawerResponsive() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Modal onOpenChange={setOpen} open={open}>
        <ModalTrigger render={<Button variant="outline" />}>
          Edit Profile
        </ModalTrigger>
        <ModalContent className="sm:max-w-[425px]">
          <ModalHeader>
            <ModalTitle>Edit profile</ModalTitle>
            <ModalDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </ModalDescription>
          </ModalHeader>
          <ProfileForm />
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger render={<Button variant="outline" />}>
        Edit Profile
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose render={<Button variant="outline" />}>
            Cancel
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
