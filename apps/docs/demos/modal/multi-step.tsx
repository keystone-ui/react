"use client";

import { Button } from "@keystoneui/react/button";
import { Input } from "@keystoneui/react/input";
import { Label } from "@keystoneui/react/label";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTrigger,
} from "@keystoneui/react/modal";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystoneui/react/stepper";
import { useState } from "react";

function StepIndicator() {
  const { value, totalSteps } = useStepper();
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: totalSteps }).map((_, i) => {
        let widthClass = "w-1.5 bg-muted";
        if (i === value) {
          widthClass = "w-6 bg-primary";
        } else if (i < value) {
          widthClass = "w-1.5 bg-primary/40";
        }
        return (
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${widthClass}`}
            key={i}
          />
        );
      })}
    </div>
  );
}

function StepNav() {
  const { goNext, goPrevious, isFirst, isLast } = useStepper();
  return (
    <ModalFooter>
      <Button onClick={isLast ? undefined : goNext}>
        {isLast ? "Get Started" : "Continue"}
      </Button>
      <Button disabled={isFirst} onClick={goPrevious} variant="outline">
        Back
      </Button>
    </ModalFooter>
  );
}

export default function ModalMultiStep() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  return (
    <Modal
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setStep(0);
        }
      }}
      open={open}
    >
      <ModalTrigger render={<Button />}>Start Onboarding</ModalTrigger>
      <ModalContent className="sm:max-w-md" showCloseButton={false}>
        <Stepper onValueChange={setStep} value={step}>
          <ModalHeader className="items-center">
            <StepIndicator />
          </ModalHeader>
          <StepperContent>
            <StepperStep>
              <h3 className="font-semibold text-lg">Welcome aboard!</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Let&apos;s set up your workspace in a few steps.
              </p>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ms-name">Full name</Label>
                  <Input id="ms-name" placeholder="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ms-email">Email</Label>
                  <Input
                    id="ms-email"
                    placeholder="john@example.com"
                    type="email"
                  />
                </div>
              </div>
            </StepperStep>
            <StepperStep>
              <h3 className="font-semibold text-lg">Create your workspace</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Choose a name and URL for your team workspace.
              </p>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ms-workspace">Workspace name</Label>
                  <Input id="ms-workspace" placeholder="Acme Inc." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ms-url">Workspace URL</Label>
                  <Input id="ms-url" placeholder="acme" />
                </div>
              </div>
            </StepperStep>
            <StepperStep>
              <h3 className="font-semibold text-lg">Invite your team</h3>
              <p className="mt-1 text-muted-foreground text-sm">
                Add team members to collaborate together.
              </p>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ms-invite">Team member email</Label>
                  <Input
                    id="ms-invite"
                    placeholder="teammate@example.com"
                    type="email"
                  />
                </div>
              </div>
            </StepperStep>
          </StepperContent>
          <StepNav />
        </Stepper>
      </ModalContent>
    </Modal>
  );
}
