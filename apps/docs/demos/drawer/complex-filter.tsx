"use client";

import { Button } from "@keystoneui/react/button";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystoneui/react/drawer";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import {
  Stepper,
  StepperContent,
  StepperStep,
  useStepper,
} from "@keystoneui/react/stepper";
import { ArrowLeft, ChevronRight, FilterIcon } from "lucide-react";
import { useState } from "react";

const DATE_RANGES = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

const CATEGORIES = [
  { label: "Electronics", value: "electronics" },
  { label: "Clothing", value: "clothing" },
  { label: "Books", value: "books" },
  { label: "Home & Garden", value: "home" },
  { label: "Sports", value: "sports" },
];

function FilterMenu() {
  const { goTo } = useStepper();
  return (
    <div className="divide-y divide-border-muted">
      {[
        { label: "Date Range", step: 1 },
        { label: "Categories", step: 2 },
      ].map((cat) => (
        <button
          className="flex h-12 w-full cursor-pointer items-center justify-between px-4 active:text-muted-foreground"
          key={cat.step}
          onClick={() => goTo(cat.step)}
          type="button"
        >
          <span className="font-medium text-sm">{cat.label}</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

function SubHeader({ title }: { title: string }) {
  const { goTo } = useStepper();
  return (
    <DrawerHeader>
      <div className="flex items-center gap-2">
        <Button
          className="-ml-1"
          onClick={() => goTo(0)}
          size="icon-xs"
          variant="ghost"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <DrawerTitle>{title}</DrawerTitle>
      </div>
    </DrawerHeader>
  );
}

export default function DrawerComplexFilter() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState("7d");
  const [categories, setCategories] = useState<string[]>(["electronics"]);

  const toggleCategory = (val: string) => {
    setCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  return (
    <Drawer
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setStep(0);
        }
      }}
      open={open}
    >
      <DrawerTrigger render={<Button variant="outline" />}>
        <FilterIcon className="size-4" />
        Filters
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <Stepper onValueChange={setStep} value={step}>
            <StepperContent>
              <StepperStep>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Filter</DrawerTitle>
                </DrawerHeader>
                <FilterMenu />
                <DrawerFooter>
                  <Button className="w-full" onClick={() => setOpen(false)}>
                    Apply
                  </Button>
                </DrawerFooter>
              </StepperStep>
              <StepperStep>
                <SubHeader title="Date Range" />
                <div className="pb-4">
                  <RadioGroup
                    className="gap-0 divide-y divide-border-muted"
                    onValueChange={(val) => val && setDateRange(val)}
                    value={dateRange}
                  >
                    {DATE_RANGES.map((range) => (
                      // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                      <label
                        className="flex h-12 cursor-pointer items-center gap-3 px-4"
                        key={range.value}
                      >
                        <RadioGroupItem value={range.value} />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </StepperStep>
              <StepperStep>
                <SubHeader title="Categories" />
                <div className="divide-y divide-border-muted pb-4">
                  {CATEGORIES.map((cat) => (
                    // biome-ignore lint/a11y/noLabelWithoutControl: control is inside label
                    <label
                      className="flex h-12 cursor-pointer items-center gap-3 px-4"
                      key={cat.value}
                    >
                      <Checkbox
                        checked={categories.includes(cat.value)}
                        onCheckedChange={() => toggleCategory(cat.value)}
                      />
                      <span className="text-sm">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </StepperStep>
            </StepperContent>
          </Stepper>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
