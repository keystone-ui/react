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
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Strings",
  component: StringsProvider,
  parameters: {
    docs: {
      description: {
        component: `
Replaces the library's built-in English for everything inside it. A part's own prop still wins, and with no provider nothing changes.

\`\`\`tsx
import { StringsProvider } from "@keystoneui/react/strings";

<StringsProvider strings={{ modal: { close: "Fermer" } }}>
  <App />
</StringsProvider>
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof StringsProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const FERMER = "Fermer";
const OUVRIR = "Ouvrir";
const CLOSE = "Close";

const french: StringsOverrides = {
  modal: { close: FERMER, footerClose: FERMER },
};

// =============================================================================
// Default
// =============================================================================
export const Default: Story = {
  render: () => (
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
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: OUVRIR }));

    const dialog = await screen.findByRole("dialog");
    // The corner X (sr-only name) and the footer button both read French.
    await waitFor(() =>
      expect(
        within(dialog).getAllByRole("button", { name: FERMER })
      ).toHaveLength(2)
    );
    await expect(
      within(dialog).queryByRole("button", { name: CLOSE })
    ).not.toBeInTheDocument();
  },
};
