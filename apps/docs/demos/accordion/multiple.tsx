"use client";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@keystoneui/react/accordion";

export default function AccordionMultiple() {
  return (
    <Accordion multiple variant="box">
      <AccordionItem value="1">
        <AccordionHeader>
          <AccordionTrigger>What makes our UI different?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Our UI focuses on developer experience and performance. Built with
          TypeScript, it offers excellent type safety, follows accessibility
          standards, and provides comprehensive documentation with regular
          updates.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="2">
        <AccordionHeader>
          <AccordionTrigger>
            How can I customize the components?
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Use our CSS variables for global styling, or className and style props
          for component-specific changes. We support CSS modules, Tailwind, and
          dark mode out of the box.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="3">
        <AccordionHeader>
          <AccordionTrigger>Is it optimized for performance?</AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Yes, with tree-shaking, code splitting, and minimal runtime overhead.
          Most components are under 5KB gzipped.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
