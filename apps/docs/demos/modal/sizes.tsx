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

const MODAL_SIZES = ["sm", "default", "lg", "xl", "full"] as const;

export default function ModalSizes() {
  return (
    <div className="flex flex-wrap gap-2">
      {MODAL_SIZES.map((size) => (
        <Modal key={size}>
          <ModalTrigger render={<Button variant="outline" />}>
            {size}
          </ModalTrigger>
          <ModalContent size={size}>
            <ModalHeader>
              <ModalTitle>Size: {size}</ModalTitle>
              <ModalDescription>
                This modal uses the <code>{size}</code> size variant.
              </ModalDescription>
            </ModalHeader>
            <div className="text-muted-foreground text-sm">
              The content area adjusts to the max-width defined by the size
              variant.
            </div>
            <ModalFooter>
              <ModalClose render={<Button variant="outline" />}>
                Close
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ))}
    </div>
  );
}
