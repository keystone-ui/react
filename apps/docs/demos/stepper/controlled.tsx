"use client";

import { Button } from "@keystoneui/react/button";
import {
  Stepper,
  StepperContent,
  StepperStep,
} from "@keystoneui/react/stepper";
import { useState } from "react";

export default function StepperControlled() {
  const [step, setStep] = useState(0);
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <Button
            key={i}
            onClick={() => setStep(i)}
            size="sm"
            variant={step === i ? "default" : "outline"}
          >
            Step {i + 1}
          </Button>
        ))}
      </div>
      <div className="mx-auto w-full max-w-[550px] rounded-xl border p-6 shadow-sm">
        <Stepper onValueChange={setStep} value={step}>
          <StepperContent>
            <StepperStep>
              <h2 className="mb-2 font-semibold text-base">Account</h2>
              <p className="text-muted-foreground text-sm">
                Configure your account settings and preferences.
              </p>
            </StepperStep>
            <StepperStep>
              <h2 className="mb-2 font-semibold text-base">Notifications</h2>
              <p className="text-muted-foreground text-sm">
                Choose how and when you want to be notified.
              </p>
            </StepperStep>
            <StepperStep>
              <h2 className="mb-2 font-semibold text-base">Privacy</h2>
              <p className="text-muted-foreground text-sm">
                Manage your privacy and data sharing preferences.
              </p>
            </StepperStep>
          </StepperContent>
        </Stepper>
      </div>
      <p className="text-muted-foreground text-sm">
        Current step: <code>{step}</code> &middot; Click any button above to
        jump directly.
      </p>
    </div>
  );
}
