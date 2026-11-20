---
"@keystoneui/react": minor
---

Add `overlayClassName` to ModalContent, DrawerContent and AlertDialogContent

Each part renders its own overlay, so until now the overlay could only be restyled with global CSS. The new `overlayClassName` prop is merged over the overlay's default classes, so yours win: `bg-black/20` lightens it and `hidden` removes it. Omitted, nothing changes. Hiding the backdrop preserves the default focus trap and document scroll lock.
