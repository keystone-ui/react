"use client";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "keystoneui/accordion";

const items = [
  {
    id: "1",
    title: "First item",
    content: "Content for the first accordion item.",
  },
  {
    id: "2",
    title: "Second item",
    content: "Content for the second accordion item.",
  },
  {
    id: "3",
    title: "Third item",
    content: "Content for the third accordion item.",
  },
];

export default function AccordionVariants() {
  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Box
        </p>
        <Accordion variant="box">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionHeader>
                <AccordionTrigger>{item.title}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>{item.content}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Underline
        </p>
        <Accordion variant="underline">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionHeader>
                <AccordionTrigger>{item.title}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>{item.content}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Ghost
        </p>
        <Accordion variant="ghost">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionHeader>
                <AccordionTrigger>{item.title}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>{item.content}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="space-y-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Table
        </p>
        <Accordion variant="table">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionHeader>
                <AccordionTrigger>{item.title}</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>{item.content}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
