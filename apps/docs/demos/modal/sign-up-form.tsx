"use client";

import { Button } from "keystoneui/button";
import { Checkbox } from "keystoneui/checkbox";
import { Input } from "keystoneui/input";
import { Label } from "keystoneui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "keystoneui/modal";
import { useState } from "react";

export default function ModalSignUpForm() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOpen(false);
    }, 1500);
  };

  return (
    <Modal onOpenChange={setOpen} open={open}>
      <ModalTrigger render={<Button />}>Create Account</ModalTrigger>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Create an account</ModalTitle>
          <ModalDescription>
            Enter your details below to create your account and get started.
          </ModalDescription>
        </ModalHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input id="first-name" placeholder="John" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input id="last-name" placeholder="Doe" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="john@example.com"
              required
              type="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" required type="password" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" required />
            <Label className="font-normal text-sm" htmlFor="terms">
              I agree to the terms and conditions
            </Label>
          </div>
          <ModalFooter className="px-0 pt-2">
            <Button fullWidth isLoading={isLoading} type="submit">
              Create account
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
