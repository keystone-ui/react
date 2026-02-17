"use client";

import { Button } from "keystoneui/button";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "keystoneui/stepper";
import { useState } from "react";

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
        Continue
      </Button>
    </div>
  );
}

export default function StepperDefault() {
  const [step, setStep] = useState(0);
  return (
    <div className="mx-auto w-full max-w-[550px] rounded-xl border p-6 shadow-sm">
      <Stepper onValueChange={setStep} value={step}>
        <StepperContent>
          <StepperStep>
            <h2 className="mb-2 font-semibold text-base">This is step one</h2>
            <p className="text-muted-foreground text-sm">
              Usually in this step we would explain why this thing exists and
              what it does. Also, we would show a button to go to the next step.
            </p>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 font-semibold text-base">This is step two</h2>
            <p className="text-muted-foreground text-sm">
              Here we collect some information or present additional details
              about the process.
            </p>
          </StepperStep>
          <StepperStep>
            <h2 className="mb-2 font-semibold text-base">This is step three</h2>
            <p className="text-muted-foreground text-sm">
              The final step confirms the action and provides a summary of what
              was accomplished.
            </p>
          </StepperStep>
        </StepperContent>
        <StepperNav />
      </Stepper>
    </div>
  );
}
