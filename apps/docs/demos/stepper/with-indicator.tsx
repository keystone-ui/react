"use client";

import { Button } from "@keystoneui/react/button";
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
    <div className="mb-4 flex items-center justify-center gap-1.5">
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
            key={`step-${i}`}
          />
        );
      })}
    </div>
  );
}

function StepperNav() {
  const { goNext, goPrevious, isFirst, isLast } = useStepper();
  return (
    <div className="mt-6 flex justify-between">
      <Button
        className="rounded-full px-5"
        disabled={isFirst}
        onClick={goPrevious}
        size="sm"
        variant="outline"
      >
        Back
      </Button>
      <Button
        className="rounded-full px-5"
        disabled={isLast}
        onClick={goNext}
        size="sm"
      >
        {isLast ? "Finish" : "Continue"}
      </Button>
    </div>
  );
}

export default function StepperWithIndicator() {
  const [step, setStep] = useState(0);
  return (
    <div className="mx-auto w-full max-w-[550px] rounded-xl border p-6 shadow-sm">
      <Stepper onValueChange={setStep} value={step}>
        <StepIndicator />
        <StepperContent>
          <StepperStep>
            <h2 className="mb-2 font-semibold text-base">
              Welcome to Keystone
            </h2>
            <p className="text-muted-foreground text-sm">
              Keystone is a beautifully crafted component library that helps you
              build modern web applications faster.
            </p>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 font-semibold text-base">
              Set up your workspace
            </h2>
            <p className="text-muted-foreground text-sm">
              Configure your development environment. Choose your preferred
              package manager and framework.
            </p>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 font-semibold text-base">
              You&apos;re all set!
            </h2>
            <p className="text-muted-foreground text-sm">
              Your workspace is ready. Start building your application with
              Keystone components.
            </p>
          </StepperStep>
        </StepperContent>
        <StepperNav />
      </Stepper>
    </div>
  );
}
