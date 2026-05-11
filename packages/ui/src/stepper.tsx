"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Children,
  type ComponentProps,
  createContext,
  isValidElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useMeasure from "react-use-measure";

import { cn } from "./utils";

// =============================================================================
// Stepper Context
// =============================================================================
interface StepperContextValue {
  /** Direction of the last transition: +1 forward, -1 backward. */
  direction: number;
  /** Navigate to the next step. */
  goNext: () => void;
  /** Navigate to the previous step. */
  goPrevious: () => void;
  /** Navigate to a specific step index. */
  goTo: (step: number) => void;
  /** Whether the current step is the first step. */
  isFirst: boolean;
  /** Whether the current step is the last step. */
  isLast: boolean;
  /** Total number of steps. */
  totalSteps: number;
  /** Current step index (0-based). */
  value: number;
}

const StepperContext = createContext<StepperContextValue | undefined>(
  undefined
);

/**
 * Hook to access the stepper state and navigation methods.
 *
 * Must be used within a `<Stepper>` component.
 */
function useStepper(): StepperContextValue {
  const context = useContext(StepperContext);
  if (context === undefined) {
    throw new Error("useStepper must be used within a <Stepper> component.");
  }
  return context;
}

// =============================================================================
// Stepper (Root)
// =============================================================================
export interface StepperProps {
  children: ReactNode;
  /** Callback when the step changes. */
  onValueChange: (value: number) => void;
  /** Current step index (0-based). */
  value: number;
}

function Stepper({ value, onValueChange, children }: StepperProps) {
  const [direction, setDirection] = useState(1);
  const previousValue = useRef(value);

  // Count StepperStep children to determine totalSteps.
  // We walk the tree looking inside StepperContent for StepperStep children.
  const totalSteps = useMemo(() => {
    let count = 0;
    const countSteps = (node: ReactNode) => {
      Children.forEach(node, (child) => {
        if (isValidElement(child) && child.type === StepperStep) {
          count++;
        } else if (isValidElement(child)) {
          const props = child.props as { children?: ReactNode };
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
  useEffect(() => {
    if (value !== previousValue.current) {
      setDirection(value > previousValue.current ? 1 : -1);
      previousValue.current = value;
    }
  }, [value]);

  const goTo = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(totalSteps - 1, step));
      onValueChange(clamped);
    },
    [totalSteps, onValueChange]
  );

  const goNext = useCallback(() => {
    goTo(value + 1);
  }, [goTo, value]);

  const goPrevious = useCallback(() => {
    goTo(value - 1);
  }, [goTo, value]);

  const contextValue = useMemo<StepperContextValue>(
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
    [value, totalSteps, direction, goTo, goNext, goPrevious]
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
  children: ReactNode;
  className?: string;
}

function StepperContent({ className, children }: StepperContentProps) {
  const { value, direction } = useStepper();
  const shouldReduceMotion = useReducedMotion();
  const [ref, bounds] = useMeasure();

  const variants = shouldReduceMotion ? reducedMotionVariants : stepVariants;
  const customValue = shouldReduceMotion ? undefined : direction;

  // Extract only StepperStep children and pick the active one
  const steps: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === StepperStep) {
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
        animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
        className={cn("relative overflow-hidden", className)}
        data-slot="stepper-content"
      >
        <div ref={ref}>
          <AnimatePresence
            custom={customValue}
            initial={false}
            mode="popLayout"
          >
            <motion.div
              animate="active"
              custom={customValue}
              exit="exit"
              initial="initial"
              key={value}
              variants={variants}
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
export interface StepperStepProps extends ComponentProps<"div"> {}

function StepperStep({ className, ...props }: StepperStepProps) {
  return <div className={className} data-slot="stepper-step" {...props} />;
}

// =============================================================================
// Exports
// =============================================================================
export { Stepper, StepperContent, StepperStep, useStepper };
