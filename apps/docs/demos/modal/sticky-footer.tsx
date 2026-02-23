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

export default function ModalStickyFooter() {
  return (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Sticky Footer
      </ModalTrigger>
      <ModalContent scrollBehavior="inside">
        <ModalHeader>
          <ModalTitle>Sticky Footer</ModalTitle>
          <ModalDescription>
            The footer stays visible while the content scrolls.
          </ModalDescription>
        </ModalHeader>
        <div className="no-scrollbar -mx-6 max-h-[50vh] overflow-y-auto px-6">
          {Array.from({ length: 10 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <p className="mb-4 leading-normal" key={index}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
        </div>
        <ModalFooter>
          <Button>Accept</Button>
          <ModalClose render={<Button variant="outline" />}>Close</ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
