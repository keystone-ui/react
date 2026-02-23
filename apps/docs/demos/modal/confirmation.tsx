"use client";

import { Button } from "@keystoneui/react/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@keystoneui/react/modal";
import { useState } from "react";

export default function ModalConfirmation() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <Modal onOpenChange={setOpen} open={open}>
        <ModalTrigger render={<Button variant="destructive" />}>
          Delete Account
        </ModalTrigger>
        <ModalContent showCloseButton={false} size="sm">
          <ModalHeader>
            <ModalTitle>Delete account?</ModalTitle>
            <ModalDescription>
              This action is permanent and cannot be undone. All your data will
              be deleted.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              onClick={() => {
                setConfirmed(true);
                setOpen(false);
              }}
              variant="destructive"
            >
              Delete
            </Button>
            <ModalClose render={<Button variant="outline" />}>
              Cancel
            </ModalClose>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {confirmed && (
        <p className="text-destructive text-sm">Account deleted.</p>
      )}
    </div>
  );
}
