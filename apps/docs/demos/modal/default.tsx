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

export default function ModalDefault() {
  return (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Open Modal
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Are you absolutely sure?</ModalTitle>
          <ModalDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button>Confirm</Button>
          <ModalClose render={<Button variant="outline" />}>Cancel</ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
