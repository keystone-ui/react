"use client";

import { Button } from "@keystoneui/react/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@keystoneui/react/modal";
import {
  type StringsOverrides,
  StringsProvider,
} from "@keystoneui/react/strings";

// Declared once, outside the component, so the provider sees the same object
// on every render.
const french: StringsOverrides = {
  modal: { close: "Fermer", footerClose: "Fermer" },
};

export default function StringsDefault() {
  return (
    <StringsProvider strings={french}>
      <Modal>
        <ModalTrigger render={<Button variant="outline" />}>
          Ouvrir
        </ModalTrigger>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Modifications enregistrées</ModalTitle>
            <ModalDescription>
              Le bouton de fermeture et son nom pour les lecteurs d’écran
              viennent du fournisseur.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter showCloseButton />
        </ModalContent>
      </Modal>
    </StringsProvider>
  );
}
