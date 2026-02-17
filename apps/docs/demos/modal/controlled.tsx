"use client";

import { Button } from "keystoneui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "keystoneui/modal";
import { useState } from "react";

export default function ModalControlled() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <Modal onOpenChange={setOpen} open={open}>
        <ModalTrigger render={<Button variant="outline" />}>
          Controlled Modal
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Controlled Modal</ModalTitle>
            <ModalDescription>
              This modal&apos;s state is controlled externally. The open state
              is: <strong>{open ? "open" : "closed"}</strong>.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button onClick={() => setOpen(false)}>Done</Button>
            <ModalClose render={<Button variant="outline" />}>
              Cancel
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <p className="text-muted-foreground text-sm">
        State: <code>{open ? "open" : "closed"}</code>
      </p>
    </div>
  );
}
