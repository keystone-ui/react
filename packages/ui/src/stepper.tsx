"use client";

import * as React from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import useMeasure from "react-use-measure";

import { cn } from "./utils";

// =============================================================================
// Stepper Context
// =============================================================================
interface StepperContextValue {
  /** Current step index (0-based). */
  value: number;
  /** Total number of steps. */
  totalSteps: number;
  /** Direction of the last transition: +1 forward, -1 backward. */
  direction: number;
  /** Navigate to a specific step index. */
  goTo: (step: number) => void;
  /** Navigate to the next step. */
  goNext: () => void;
  /** Navigate to the previous step. */
  goPrevious: () => void;
  /** Whether the current step is the first step. */
  isFirst: boolean;
  /** Whether the current step is the last step. */
  isLast: boolean;
}

const StepperContext = React.createContext<StepperContextValue | undefined>(
  undefined,
);

/**
 * Hook to access the stepper state and navigation methods.
 *
 * Must be used within a `<Stepper>` component.
 */
function useStepper(): StepperContextValue {
  const context = React.useContext(StepperContext);
  if (context === undefined) {
    throw new Error("useStepper must be used within a <Stepper> component.");
  }
  return context;
}

// =============================================================================
// Stepper (Root)
// =============================================================================
export interface StepperProps {
  /** Current step index (0-based). */
  value: number;
  /** Callback when the step changes. */
  onValueChange: (value: number) => void;
  children: React.ReactNode;
}

function Stepper({ value, onValueChange, children }: StepperProps) {
  const [direction, setDirection] = React.useState(1);
  const previousValue = React.useRef(value);

  // Count StepperStep children to determine totalSteps.
  // We walk the tree looking inside StepperContent for StepperStep children.
  const totalSteps = React.useMemo(() => {
    let count = 0;
    const countSteps = (node: React.ReactNode) => {
      React.Children.forEach(node, (child) => {
        if (React.isValidElement(child) && child.type === StepperStep) {
          count++;
        } else if (React.isValidElement(child)) {
          const props = child.props as { children?: React.ReactNode };
          if (props.children) {
            countSteps(props.children);
          }
        }
      });
    };
    countSteps(children);
    return count;
  }, [children]);

  // Track direction based on value changes
  React.useEffect(() => {
    if (value !== previousValue.current) {
      setDirection(value > previousValue.current ? 1 : -1);
      previousValue.current = value;
    }
  }, [value]);

  const goTo = React.useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(totalSteps - 1, step));
      onValueChange(clamped);
    },
    [totalSteps, onValueChange],
  );

  const goNext = React.useCallback(() => {
    goTo(value + 1);
  }, [goTo, value]);

  const goPrevious = React.useCallback(() => {
    goTo(value - 1);
  }, [goTo, value]);

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      value,
      totalSteps,
      direction,
      goTo,
      goNext,
      goPrevious,
      isFirst: value === 0,
      isLast: value === totalSteps - 1,
    }),
    [value, totalSteps, direction, goTo, goNext, goPrevious],
  );

  return (
    <StepperContext.Provider value={contextValue}>
      {children}
    </StepperContext.Provider>
  );
}

// =============================================================================
// StepperContent (Animated container)
// =============================================================================
const stepVariants = {
  initial: (direction: number) => ({
    x: `${110 * direction}%`,
    opacity: 0,
  }),
  active: { x: "0%", opacity: 1 },
  exit: (direction: number) => ({
    x: `${-110 * direction}%`,
    opacity: 0,
  }),
};

const reducedMotionVariants = {
  initial: { opacity: 0 },
  active: { opacity: 1 },
  exit: { opacity: 0 },
};

export interface StepperContentProps {
  className?: string;
  children: React.ReactNode;
}

function StepperContent({ className, children }: StepperContentProps) {
  const { value, direction } = useStepper();
  const shouldReduceMotion = useReducedMotion();
  const [ref, bounds] = useMeasure();

  const variants = shouldReduceMotion ? reducedMotionVariants : stepVariants;
  const customValue = shouldReduceMotion ? undefined : direction;

  // Extract only StepperStep children and pick the active one
  const steps: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === StepperStep) {
      steps.push(child);
    }
  });

  const activeStep = steps[value] ?? null;

  return (
    <MotionConfig
      transition={
        shouldReduceMotion
          ? { duration: 0.15 }
          : { duration: 0.5, type: "spring", bounce: 0 }
      }
    >
      <motion.div
        data-slot="stepper-content"
        animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
        className={cn("relative overflow-hidden", className)}
      >
        <div ref={ref}>
          <AnimatePresence
            mode="popLayout"
            initial={false}
            custom={customValue}
          >
            <motion.div
              key={value}
              variants={variants}
              initial="initial"
              animate="active"
              exit="exit"
              custom={customValue}
            >
              {activeStep}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

// =============================================================================
// StepperStep (Individual step wrapper)
// =============================================================================
export interface StepperStepProps extends React.ComponentProps<"div"> {}

function StepperStep({ className, ...props }: StepperStepProps) {
  return (
    <div data-slot="stepper-step" className={className} {...props} />
  );
}

// =============================================================================
// Exports
// =============================================================================
export { Stepper, StepperContent, StepperStep, useStepper };
