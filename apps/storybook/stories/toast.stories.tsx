import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "keystoneui/button";
import type { ToasterProps } from "keystoneui/toast";
import { Toaster, toast } from "keystoneui/toast";
import { UsersIcon } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";

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
A toast notification component built on [Base UI Toast](https://base-ui.com/react/components/toast). Renders non-intrusive feedback messages that appear temporarily and auto-dismiss.

The \`Toaster\` component is a provider — mount it once at the root of your app. Use the imperative \`toast()\` function to trigger notifications from anywhere.

\`\`\`tsx
import { Toaster, toast } from "keystoneui/toast";

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
\`\`\`

## Theme

The Toaster inherits your app's light/dark theme automatically via Tailwind's \`.dark\` class — no additional configuration needed.

## Semantic Colors

Success, error, warning, and info toasts automatically color their icon and title to match the toast type, consistent with the Alert component palette.

## Duration & Close Button

\`\`\`tsx
// Custom duration (10 seconds)
toast("Saved", { duration: 10000 });

// Persistent toast — stays open until dismissed
toast("Please confirm", { duration: Infinity });

// Show/hide close button per toast
toast("Hello", { closeButton: true });

// Or control globally via Toaster
<Toaster closeButton />

// Prevent the user from swiping/clicking to dismiss
toast.warning("Critical action", { dismissible: false });
\`\`\`

## Key Props

- \`duration\` — Auto-close delay in ms. Default 5 000. Set \`Infinity\` to keep open.
- \`closeButton\` — Show an × close button on all toasts. Pass on \`Toaster\` or per-toast.
- \`dismissible\` — Whether the toast can be swiped/clicked away. Default \`true\`.
- \`position\` — Where toasts appear (on the \`Toaster\`). Default \`"bottom-right"\`.
- \`limit\` — Maximum simultaneous toasts. Default \`3\`.

## API Reference

See the [Base UI Toast docs](https://base-ui.com/react/components/toast) for the full primitive API reference.
`,
      },
    },
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      description: "Where toasts appear on screen",
    },
    duration: {
      control: "number",
      description: "Default auto-dismiss duration in milliseconds",
    },
    limit: {
      control: "number",
      description: "Maximum number of visible toasts",
    },
    closeButton: {
      control: "boolean",
      description: "Whether to show a close button on toasts",
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof Toaster>;

// ── Core ────────────────────────────────────────────────────────────────

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "A basic default toast triggered with a simple string message.",
      },
    },
  },
  render: () => (
    <div>
      <Button onClick={() => toast("Event has been created")} variant="outline">
        Show Toast
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /show toast/i });

    await userEvent.click(trigger);
    await new Promise((r) => setTimeout(r, 500));

    const toastElement = document.querySelector("[data-slot='toast-title']");
    await expect(toastElement).toBeInTheDocument();
  },
};

// ── Types ───────────────────────────────────────────────────────────────

export const Types: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All toast types: default, success, info, warning, error, and loading. Each type displays a distinct icon and semantic color on the icon and title.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => toast("Event has been created")}
          variant="outline"
        >
          Default
        </Button>
        <Button
          onClick={() => toast.success("Event has been created")}
          variant="outline"
        >
          Success
        </Button>
        <Button
          onClick={() =>
            toast.info("Be at the area 10 minutes before the event time")
          }
          variant="outline"
        >
          Info
        </Button>
        <Button
          onClick={() =>
            toast.warning("Event start time cannot be earlier than 8am")
          }
          variant="outline"
        >
          Warning
        </Button>
        <Button
          onClick={() => toast.error("Event has not been created")}
          variant="outline"
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
          onClick={() =>
            toast("Event has been created", {
              description: "Monday, January 3rd at 6:00pm",
            })
          }
          variant="outline"
        >
          Default
        </Button>
        <Button
          onClick={() =>
            toast.success("You have upgraded your plan", {
              description: "You can continue using HeroUI Chat",
            })
          }
          variant="outline"
        >
          Success
        </Button>
        <Button
          onClick={() =>
            toast.error("Storage is full", {
              description: "Remove files to release space.",
            })
          }
          variant="outline"
        >
          Error
        </Button>
        <Button
          onClick={() =>
            toast.warning("Your session is about to expire due to inactivity", {
              description:
                "You will be automatically logged out in 5 minutes. Please save any unsaved changes before your session ends.",
            })
          }
          variant="outline"
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
          onClick={() =>
            toast("Event has been created", {
              action: {
                label: "Undo",
                onClick: () => toast("Event undone"),
              },
            })
          }
          variant="outline"
        >
          With Action
        </Button>
        <Button
          onClick={() =>
            toast("You have been invited to join a team", {
              description: "Bob sent you an invitation to join HeroUI team",
              cancel: {
                label: "Dismiss",
                onClick: () => undefined,
              },
            })
          }
          variant="outline"
        >
          With Dismiss
        </Button>
        <Button
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
          variant="outline"
        >
          Destructive Action
        </Button>
        <Button
          onClick={() =>
            toast.success("Payment processed", {
              description: "Your invoice has been sent to your email",
              action: {
                label: "View",
                onClick: () => undefined,
              },
              cancel: {
                label: "Dismiss",
                onClick: () => undefined,
              },
            })
          }
          variant="outline"
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
          onClick={() => {
            toast.promise(uploadFile(), {
              loading: "Uploading file...",
              success: (data) =>
                `File ${data.filename} uploaded (${data.size}KB)`,
              error: "Failed to upload file",
            });
          }}
          variant="outline"
        >
          Upload File
        </Button>
        <Button
          onClick={() => {
            toast.promise(createEvent(), {
              loading: "Creating event...",
              success: "Event created",
              error: (err) => err.message,
            });
          }}
          variant="outline"
        >
          Create Event (Error)
        </Button>
        <Button
          onClick={() => {
            toast.promise(saveData(), {
              loading: "Saving changes...",
              success: (data) => `Saved ${data.count} items`,
              error: (err) => err.message,
            });
          }}
          variant="outline"
        >
          Save Data (Random)
        </Button>
        <Button
          onClick={() => {
            toast.promise(fetchUser(), {
              loading: "Loading user...",
              success: (data) => `Welcome back, ${data.name}!`,
              error: "Failed to fetch user",
            });
          }}
          variant="outline"
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
          "Manually control loading state with `toast.loading()` and update the same toast by passing its `id` to `toast.success()` or `toast.error()`. The toast transitions in-place without creating a new one.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
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
          variant="outline"
        >
          Upload (Success)
        </Button>
        <Button
          onClick={() => {
            const id = toast.loading("Processing payment...");
            setTimeout(() => {
              toast.success("Payment processed", {
                id,
                description: "Your payment has been processed successfully",
              });
            }, 2500);
          }}
          variant="outline"
        >
          Payment (Success)
        </Button>
        <Button
          onClick={() => {
            const id = toast.loading("Saving changes...");
            setTimeout(() => {
              toast.error("Failed to save", {
                id,
                description: "Please try again",
              });
            }, 2000);
          }}
          variant="outline"
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
          onClick={() =>
            toast.custom((t) => (
              <div className="flex w-[356px] flex-wrap items-center gap-3 rounded-lg border border-border-muted bg-popover p-4 text-popover-foreground shadow-lg">
                <UsersIcon className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1 basis-[calc(100%-2.75rem)]">
                  <p className="font-medium text-sm">
                    You have been invited to join a team
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Bob sent you an invitation to join HeroUI team
                  </p>
                </div>
                <Button
                  onClick={() => toast.dismiss(t)}
                  size="sm"
                  variant="secondary"
                >
                  Dismiss
                </Button>
              </div>
            ))
          }
          variant="outline"
        >
          Team Invitation
        </Button>
        <Button
          onClick={() =>
            toast.custom((t) => (
              <div className="flex w-[356px] flex-wrap items-center gap-3 rounded-lg border border-border-muted bg-popover p-4 text-popover-foreground shadow-lg">
                <div className="min-w-0 flex-1 basis-full">
                  <p className="font-medium text-sm">New deployment ready</p>
                  <p className="text-muted-foreground text-xs">
                    v2.4.1 has been deployed to production
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    onClick={() => toast.dismiss(t)}
                    size="sm"
                    variant="outline"
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={() => {
                      toast.dismiss(t);
                      toast.success("Navigating to deployment...");
                    }}
                    size="sm"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          }
          variant="outline"
        >
          Deployment Notice
        </Button>
      </div>
    </div>
  ),
};

// ── Position ────────────────────────────────────────────────────────────

/**
 * Helper that renders the Toaster story with a specific position.
 * Each position renders its own Toast.Provider, so the toasts are
 * independent across stories.
 */
function PositionDemo({ position }: { position: ToasterProps["position"] }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-muted-foreground text-sm">
        Current position:{" "}
        <code className="font-mono text-foreground">{position}</code>
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          onClick={() =>
            toast(`Toast at ${position}`, {
              description: "This toast appears at the configured position.",
            })
          }
          variant="outline"
        >
          Show Toast
        </Button>
      </div>
    </div>
  );
}

export const Position: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `position` prop on the `Toaster` to control where toasts appear. Supported positions: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right. In this demo the Toaster is set to bottom-right (the default).",
      },
    },
  },
  render: () => <PositionDemo position="bottom-right" />,
};

// ── Duration & Close ────────────────────────────────────────────────────

export const DurationAndClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Control how long a toast stays visible with `duration` (in ms). Set `duration: Infinity` to keep it open until the user dismisses it. Use `closeButton: true` to show an × button, or `dismissible: false` to prevent swipe/click dismissal.",
      },
    },
  },
  render: () => (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast("This toast stays for 10 seconds", {
              duration: 10_000,
            })
          }
          variant="outline"
        >
          Custom Duration (10s)
        </Button>
        <Button
          onClick={() =>
            toast("This toast won't auto-close", {
              duration: Number.POSITIVE_INFINITY,
              description: "Swipe or click to dismiss manually",
            })
          }
          variant="outline"
        >
          Persistent
        </Button>
        <Button
          onClick={() =>
            toast("Toast with close button", {
              closeButton: true,
              description: "Click the × to dismiss",
            })
          }
          variant="outline"
        >
          Close Button
        </Button>
        <Button
          onClick={() =>
            toast.warning("Critical: this cannot be dismissed", {
              dismissible: false,
              duration: 5000,
              description: "Will auto-close after 5 seconds",
            })
          }
          variant="outline"
        >
          Non-Dismissible
        </Button>
      </div>
    </div>
  ),
};
