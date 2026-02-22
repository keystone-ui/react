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

export default function ModalNested() {
  return (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Open Parent
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Parent Modal</ModalTitle>
          <ModalDescription>
            This is the parent modal. You can open a nested modal from here.
          </ModalDescription>
        </ModalHeader>
        <Modal>
          <ModalTrigger render={<Button variant="secondary" />}>
            Open Nested Modal
          </ModalTrigger>
          <ModalContent size="sm">
            <ModalHeader>
              <ModalTitle>Nested Modal</ModalTitle>
              <ModalDescription>
                This is a nested modal. Closing this will return focus to the
                parent modal.
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <ModalClose render={<Button />}>Got it</ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <ModalFooter>
          <ModalClose render={<Button variant="outline" />}>Close</ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
