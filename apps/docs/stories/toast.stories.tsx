import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toast } from "@keystone/ui/toast";
import { Button } from "@keystone/ui/button";
import { UsersIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers for promise / loading stories
// ---------------------------------------------------------------------------

const uploadFile = (): Promise<{ filename: string; size: number }> =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ filename: "document.pdf", size: 1024 }), 2000)
  );

const createEvent = (): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error("Network error. Please try again.")),
      2000
    )
  );

const saveData = (): Promise<{ count: number }> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve({ count: 42 });
      } else {
        reject(new Error("Failed to save data"));
      }
    }, 2000)
  );

const fetchUser = (): Promise<{ name: string; email: string }> =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ name: "John Doe", email: "john@example.com" }),
      2000
    )
  );

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/Toast",
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component: `
A toast notification component powered by [Sonner](https://sonner.emilkowal.dev/). Renders non-intrusive feedback messages that appear temporarily and auto-dismiss.

The \`Toaster\` component is a provider — mount it once at the root of your app. Use the imperative \`toast()\` function to trigger notifications from anywhere.

\`\`\`tsx
import { Toaster, toast } from "@keystone/ui/toast";

// 1. Mount the provider once in your layout
<Toaster />

// 2. Trigger toasts anywhere
toast("Event has been created");
toast.success("Payment processed");
toast.error("Something went wrong");
toast.warning("Rate limit approaching");
toast.info("New feature available");

// With a description
toast("Event has been created", {
  description: "Monday, January 3rd at 6:00pm",
});

// With action buttons
toast("File moved to trash", {
  action: { label: "Undo", onClick: () => console.log("Undo") },
});

// Promise-based (auto loading → success / error)
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Data saved",
  error: "Failed to save",
});

// Manual loading → resolution
const id = toast.loading("Uploading file...");
// Later:
toast.success("File uploaded!", { id });

// Custom JSX toast
toast.custom((t) => (
  <div className="flex items-center gap-3 rounded-lg border p-4">
    <p>Custom content</p>
    <button onClick={() => toast.dismiss(t)}>Close</button>
  </div>
));

// Custom position
toast("Hello", { position: "top-center" });
\`\`\`

## Theme

The Toaster auto-detects light/dark mode by watching the \`.dark\` class on \`<html>\`. You can also pass a \`theme\` prop explicitly:

\`\`\`tsx
<Toaster theme="dark" />
<Toaster theme="light" />
<Toaster theme="system" />
\`\`\`

## Semantic Colors

Success, error, warning, and info toasts automatically color their icon and title to match the toast type, consistent with the Alert component palette.

## Duration & Close Button

\`\`\`tsx
// Custom duration (10 seconds)
toast("Saved", { duration: 10000 });

// Persistent toast — stays open until dismissed
toast("Please confirm", { duration: Infinity });

// Show a close button (X) on a specific toast
toast("Hello", { closeButton: true });

// Or enable the close button globally
<Toaster closeButton />

// Prevent the user from swiping/clicking to dismiss
toast.warning("Critical action", { dismissible: false });
\`\`\`

## Key Props

- \`duration\` — Auto-close delay in ms. Default ~4 000. Set \`Infinity\` to keep open.
- \`closeButton\` — Show an X close button on all toasts. Pass on \`Toaster\` or per-toast.
- \`dismissible\` — Whether the toast can be swiped/clicked away. Default \`true\`.
- \`onAutoClose\` — Callback when a toast auto-closes after its duration.
- \`onDismiss\` — Callback when a toast is manually dismissed by the user.
- \`position\` — Where toasts appear. Default \`"bottom-right"\`.

> **Note on \`richColors\`:** Sonner provides a \`richColors\` prop that applies colored backgrounds to semantic toasts. This component already applies its own coloring (icon + title only), so the two approaches should not be combined — using \`richColors\` alongside the default styling will produce conflicting visuals.

## API Reference

See the [Sonner documentation](https://sonner.emilkowal.dev/) for the full API reference, including custom JSX toasts, action buttons, dismiss behavior, and more.
`,
      },
    },
  },
} as Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof Toaster>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A basic default toast triggered with a simple string message.",
      },
    },
  },
  render: () => (
    <div>
      <Button
        variant="outline"
        onClick={() => toast("Event has been created")}
      >
        Show Toast
      </Button>
    </div>
  ),
};

// ── Types ───────────────────────────────────────────────────────────────

export const Types: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All toast types: default, success, info, warning, error, and promise. Each type displays a distinct icon and semantic color on the icon and title.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => toast("Event has been created")}
        >
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Event has been created")}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.info("Be at the area 10 minutes before the event time")
          }
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("Event start time cannot be earlier than 8am")
          }
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Event has not been created")}
        >
          Error
        </Button>
      </div>
    </div>
  ),
};

// ── Description ─────────────────────────────────────────────────────────

export const WithDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A toast with both a title and a description for additional context.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", {
              description: "Monday, January 3rd at 6:00pm",
            })
          }
        >
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("You have upgraded your plan", {
              description: "You can continue using HeroUI Chat",
            })
          }
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Storage is full", {
              description:
                "Remove files to release space.",
            })
          }
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning(
              "Your session is about to expire due to inactivity",
              {
                description:
                  "You will be automatically logged out in 5 minutes. Please save any unsaved changes before your session ends.",
              }
            )
          }
        >
          Long Text
        </Button>
      </div>
    </div>
  ),
};

// ── Actions ─────────────────────────────────────────────────────────────

export const WithAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Toasts can include action and cancel buttons. Use `action` for a primary action and `cancel` for a dismiss/secondary action.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", {
              action: {
                label: "Undo",
                onClick: () => toast("Event undone"),
              },
            })
          }
        >
          With Action
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("You have been invited to join a team", {
              description: "Bob sent you an invitation to join HeroUI team",
              cancel: {
                label: "Dismiss",
                onClick: () => {},
              },
            })
          }
        >
          With Dismiss
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Storage is full", {
              description:
                "Remove files to release space. Adding more text to demonstrate longer content display",
              action: {
                label: "Remove",
                onClick: () => toast.success("Files removed"),
              },
            })
          }
        >
          Destructive Action
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Payment processed", {
              description: "Your invoice has been sent to your email",
              action: {
                label: "View",
                onClick: () => {},
              },
              cancel: {
                label: "Dismiss",
                onClick: () => {},
              },
            })
          }
        >
          Both Buttons
        </Button>
      </div>
    </div>
  ),
};

// ── Promise ─────────────────────────────────────────────────────────────

export const PromiseToast: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `toast.promise()` to automatically handle loading, success, and error states. The toast transitions through each state as the promise resolves or rejects.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            toast.promise(uploadFile(), {
              loading: "Uploading file...",
              success: (data) =>
                `File ${data.filename} uploaded (${data.size}KB)`,
              error: "Failed to upload file",
            });
          }}
        >
          Upload File
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.promise(createEvent(), {
              loading: "Creating event...",
              success: "Event created",
              error: (err) => err.message,
            });
          }}
        >
          Create Event (Error)
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.promise(saveData(), {
              loading: "Saving changes...",
              success: (data) => `Saved ${data.count} items`,
              error: (err) => err.message,
            });
          }}
        >
          Save Data (Random)
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.promise(fetchUser(), {
              loading: "Loading user...",
              success: (data) => `Welcome back, ${data.name}!`,
              error: "Failed to fetch user",
            });
          }}
        >
          Fetch User
        </Button>
      </div>
    </div>
  ),
};

// ── Manual Loading ──────────────────────────────────────────────────────

export const ManualLoading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Manually control loading state with `toast.loading()` and update the same toast by passing its `id` to `toast.success()` or `toast.error()`. The toast transitions in-place without creating a new one.',
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const id = toast.loading("Uploading file...", {
              description: "Please wait while we upload your file",
            });
            setTimeout(() => {
              toast.success("File uploaded", {
                id,
                description: "Your file has been uploaded successfully",
              });
            }, 3000);
          }}
        >
          Upload (Success)
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const id = toast.loading("Processing payment...");
            setTimeout(() => {
              toast.success("Payment processed", {
                id,
                description: "Your payment has been processed successfully",
              });
            }, 2500);
          }}
        >
          Payment (Success)
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const id = toast.loading("Saving changes...");
            setTimeout(() => {
              toast.error("Failed to save", {
                id,
                description: "Please try again",
              });
            }, 2000);
          }}
        >
          Save (Error)
        </Button>
      </div>
    </div>
  ),
};

// ── Custom ──────────────────────────────────────────────────────────────

export const CustomToast: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `toast.custom()` for fully custom JSX. You have complete control over the layout and can call `toast.dismiss(t)` to close the toast programmatically.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((t) => (
              <div className="flex w-(--width) items-center gap-3 rounded-lg border border-border-muted bg-popover p-4 text-popover-foreground shadow-lg">
                <UsersIcon className="size-5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    You have been invited to join a team
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bob sent you an invitation to join HeroUI team
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => toast.dismiss(t)}
                >
                  Dismiss
                </Button>
              </div>
            ))
          }
        >
          Team Invitation
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((t) => (
              <div className="flex w-(--width) items-center gap-3 rounded-lg border border-border-muted bg-popover p-4 text-popover-foreground shadow-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    New deployment ready
                  </p>
                  <p className="text-xs text-muted-foreground">
                    v2.4.1 has been deployed to production
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.dismiss(t)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.dismiss(t);
                      toast.success("Navigating to deployment...");
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          }
        >
          Deployment Notice
        </Button>
      </div>
    </div>
  ),
};

// ── Position ────────────────────────────────────────────────────────────

export const Position: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `position` option to control where the toast appears. Supported positions: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", { position: "top-left" })
          }
        >
          Top Left
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", { position: "top-center" })
          }
        >
          Top Center
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", { position: "top-right" })
          }
        >
          Top Right
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", { position: "bottom-left" })
          }
        >
          Bottom Left
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", { position: "bottom-center" })
          }
        >
          Bottom Center
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Event has been created", { position: "bottom-right" })
          }
        >
          Bottom Right
        </Button>
      </div>
    </div>
  ),
};

// ── Duration & Close ────────────────────────────────────────────────────

export const DurationAndClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Control how long a toast stays visible with `duration` (in ms). Set `duration: Infinity` to keep it open until the user dismisses it. Use `closeButton: true` to show an X button, or `dismissible: false` to prevent swipe/click dismissal.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            toast("This toast stays for 10 seconds", {
              duration: 10000,
            })
          }
        >
          Custom Duration (10s)
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("This toast won't auto-close", {
              duration: Infinity,
              description: "Swipe or click to dismiss manually",
            })
          }
        >
          Persistent
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Toast with close button", {
              closeButton: true,
              description: "Click the X to dismiss",
            })
          }
        >
          Close Button
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("Critical: this cannot be dismissed", {
              dismissible: false,
              duration: 5000,
              description: "Will auto-close after 5 seconds",
            })
          }
        >
          Non-Dismissible
        </Button>
      </div>
    </div>
  ),
};
