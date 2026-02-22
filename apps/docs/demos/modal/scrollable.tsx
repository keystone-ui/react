"use client";

import { Button } from "@keystoneui/react/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@keystoneui/react/modal";

export default function ModalScrollable() {
  return (
    <Modal>
      <ModalTrigger render={<Button variant="outline" />}>
        Scrollable Content
      </ModalTrigger>
      <ModalContent scrollBehavior="inside">
        <ModalHeader>
          <ModalTitle>Scrollable Content</ModalTitle>
          <ModalDescription>
            This modal scrolls content internally while the header stays fixed.
          </ModalDescription>
        </ModalHeader>
        <div className="no-scrollbar -mx-6 max-h-[50vh] overflow-y-auto px-6">
          {Array.from({ length: 10 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static demo content
            <p className="mb-4 leading-normal" key={`paragraph-${index}`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          ))}
        </div>
        <div className="flex justify-end">
          <ModalClose render={<Button variant="outline" />}>Close</ModalClose>
        </div>
      </ModalContent>
    </Modal>
  );
}
