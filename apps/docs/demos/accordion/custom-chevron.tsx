"use client";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "keystoneui/accordion";
import { Plus } from "lucide-react";

export default function AccordionCustomChevron() {
  return (
    <Accordion variant="box">
      <AccordionItem value="1">
        <AccordionHeader>
          <AccordionTrigger
            chevronIcon={
              <Plus
                aria-hidden="true"
                className="size-3 shrink-0 transition-all ease-out group-data-[panel-open]:rotate-45 group-data-[panel-open]:scale-110"
              />
            }
          >
            Custom Chevron Icon
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          This accordion uses a plus icon instead of the default chevron. The
          icon rotates 45 degrees and scales up when the panel is open.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem value="2">
        <AccordionHeader>
          <AccordionTrigger
            chevronIcon={
              <Plus
                aria-hidden="true"
                className="size-3 shrink-0 transition-all ease-out group-data-[panel-open]:rotate-45 group-data-[panel-open]:scale-110"
              />
            }
          >
            Another Item
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionPanel>
          Each item can use the same custom chevron icon for a consistent look.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
