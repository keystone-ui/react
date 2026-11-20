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

export default function ModalLighterOverlay() {
  return (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Lighter overlay
      </ModalTrigger>
      <ModalContent overlayClassName="bg-black/20 backdrop-blur-sm">
        <ModalHeader>
          <ModalTitle>Lighter overlay</ModalTitle>
          <ModalDescription>
            The page behind stays visible through a light, blurred tint.
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <ModalClose render={<Button variant="outline" />}>Cancel</ModalClose>
          <ModalClose render={<Button />}>Done</ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
