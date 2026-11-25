import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  HeldPress,
  OFFSCREEN,
  type PressDriver,
} from "../.storybook/held-press";

/**
 * The stories in a file share one page and one real mouse. The two hand-off
 * stories check the Vitest set-up that lets go of a press one play leaves
 * held: each first checks that its own first trusted move has no button
 * down, then leaves its press held. Whichever runs second therefore starts
 * after a leaked press, in either order. The corner story checks that a
 * control in the viewport's corner is not hovered when its play starts. The
 * held-press stories drive the press record with a fake driver: no real
 * mouse, no DOM.
 */
const meta = {
  title: "Testing/SharedPointer",
  parameters: { layout: "padded" },
  tags: ["!dev", "!autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The custom browser commands registered in vitest.config.ts. */
interface RealCommands {
  pointerDown: () => Promise<void>;
  pointerMoveTo: (selector: string) => Promise<void>;
}

/**
 * Vitest's real (Playwright) mouse. Absent when Storybook runs the play, which
 * then skips; under Vitest a missing set-up fails the play instead of passing
 * it silently.
 */
function realCommands() {
  const commands = (globalThis as { __realCommands?: RealCommands })
    .__realCommands;
  // Vitest's browser mode marks the page with `__vitest_browser__`.
  const underVitest =
    (globalThis as { __vitest_browser__?: boolean }).__vitest_browser__ ===
      true ||
    Boolean((import.meta as { env?: Record<string, unknown> }).env?.VITEST);
  if (!commands && underVitest) {
    throw new Error("The real browser commands are missing (set-up not run)");
  }
  return commands;
}

const frame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Waits up to `frames` animation frames for `check` to hold. */
async function until(check: () => boolean, frames = 60) {
  for (let i = 0; i < frames && !check(); i++) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await frame();
  }
  return check();
}

function Target({ left, top }: { left: number; top: number }) {
  return (
    <button
      className="cursor-pointer rounded-md border px-4 py-2"
      data-testid="shared-pointer-target"
      style={{ position: "fixed", left, top }}
      type="button"
    >
      Target
    </button>
  );
}

const TARGET = '[data-testid="shared-pointer-target"]';

/**
 * Checks that this play's first trusted move has no button down, presses the
 * target and ends with the press still held, as a play that fails or times
 * out before its `pointerUp` does. The set-up lets go of it after the story.
 */
async function handOff(canvasElement: HTMLElement) {
  const commands = realCommands();
  if (!commands) {
    return;
  }
  const target = canvasElement.querySelector(TARGET) as HTMLElement;
  const buttons: number[] = [];
  const onMove = (event: PointerEvent) => {
    if (event.isTrusted) {
      buttons.push(event.buttons);
    }
  };
  document.addEventListener("pointermove", onMove, true);
  try {
    await commands.pointerMoveTo(TARGET);
    await until(() => buttons.length > 0);
  } finally {
    document.removeEventListener("pointermove", onMove, true);
  }
  await expect(buttons[0], "buttons on the first trusted move").toBe(0);
  await commands.pointerDown();
  await expect(
    await until(() => target.matches(":active")),
    "own press applies"
  ).toBe(true);
}

export const HandOffPressFirst: Story = {
  name: "Hand Off Press First",
  render: () => <Target left={160} top={120} />,
  play: ({ canvasElement }) => handOff(canvasElement),
};

export const HandOffPressSecond: Story = {
  name: "Hand Off Press Second",
  render: () => <Target left={320} top={200} />,
  play: ({ canvasElement }) => handOff(canvasElement),
};

// Checks that a control in the viewport's corner is not hovered when its play
// starts, whatever ran before it (the release parks the pointer outside the
// viewport, not on the corner). It sends no input of its own.
export const CornerControlAtRest: Story = {
  name: "Corner Control At Rest",
  render: () => (
    <button
      data-testid="shared-pointer-corner"
      style={{ position: "fixed", left: 0, top: 0, width: 100, height: 60 }}
      type="button"
    >
      Corner
    </button>
  ),
  play: async ({ canvasElement }) => {
    if (!realCommands()) {
      return;
    }
    const corner = canvasElement.querySelector(
      '[data-testid="shared-pointer-corner"]'
    ) as HTMLElement;
    await frame();
    await frame();
    await expect(
      document.elementFromPoint(0, 0),
      "the control covers the corner"
    ).toBe(corner);
    await expect(corner.matches(":hover"), "corner control hovered").toBe(
      false
    );
  },
};

// ---------------------------------------------------------------------------
// The press record (.storybook/held-press.ts) against a fake driver
// ---------------------------------------------------------------------------

/** A promise the play settles by hand, for a driver call still in flight. */
const deferred = () => Promise.withResolvers<void>();

/** Lets every promise callback already queued run. */
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * A driver that logs each call as it is made and answers with the next
 * scripted result for that call (success when none is scripted).
 */
class FakeDriver implements PressDriver {
  readonly calls: string[] = [];
  readonly #results: Record<"down" | "move" | "up", (() => Promise<void>)[]> = {
    down: [],
    move: [],
    up: [],
  };

  next(call: "down" | "move" | "up", result: () => Promise<void>) {
    this.#results[call].push(result);
    return this;
  }

  rejectNext(call: "down" | "move" | "up") {
    return this.next(call, () =>
      Promise.reject(new Error(`${call} rejected before dispatch`))
    );
  }

  #answer(call: "down" | "move" | "up") {
    const result = this.#results[call].shift();
    return result ? result() : Promise.resolve();
  }

  down = () => {
    this.calls.push("down");
    return this.#answer("down");
  };

  move = (x: number, y: number) => {
    this.calls.push(`move ${x},${y}`);
    return this.#answer("move");
  };

  up = () => {
    this.calls.push("up");
    return this.#answer("up");
  };
}

const MOVE_OFF = `move ${OFFSCREEN.x},${OFFSCREEN.y}`;

const recordCase = (check: () => Promise<void>): Story => ({
  render: () => <p>Press record check: no real input.</p>,
  play: check,
});

// An idle page: the release sends no input at all.
export const HeldPressIdlePageSendsNothing: Story = {
  ...recordCase(async () => {
    const driver = new FakeDriver();
    const press = new HeldPress(driver);
    await expect(await press.release()).toBe(false);
    await expect(driver.calls).toEqual([]);
  }),
  name: "Held Press Idle Page Sends Nothing",
};

// A rejected first down still counts as held, since the driver may have
// pressed the button before it rejected: the release moves offscreen and
// sends one up, and a second release sends nothing.
export const HeldPressRejectedFirstDownIsReleased: Story = {
  ...recordCase(async () => {
    const driver = new FakeDriver().rejectNext("down");
    const press = new HeldPress(driver);
    await expect(press.down()).rejects.toThrow("down rejected");
    await expect(press.held, "held after the rejected down").toBe(true);
    await expect(await press.release()).toBe(true);
    await expect(await press.release()).toBe(false);
    await expect(driver.calls).toEqual(["down", MOVE_OFF, "up"]);
  }),
  name: "Held Press Rejected First Down Is Released",
};

// A second down rejected before dispatch keeps the first press held, and
// the release lets go of it once.
export const HeldPressRejectedSecondDownKeepsHold: Story = {
  ...recordCase(async () => {
    const driver = new FakeDriver();
    const press = new HeldPress(driver);
    await press.down();
    driver.rejectNext("down");
    await expect(press.down()).rejects.toThrow("down rejected");
    await expect(press.held, "first press still held").toBe(true);
    await expect(await press.release()).toBe(true);
    await expect(driver.calls).toEqual(["down", "down", MOVE_OFF, "up"]);
  }),
  name: "Held Press Rejected Second Down Keeps Hold",
};

// Two downs of the one primary button need one up.
export const HeldPressTwoDownsOneUp: Story = {
  ...recordCase(async () => {
    const driver = new FakeDriver();
    const press = new HeldPress(driver);
    await press.down();
    await press.down();
    await expect(await press.release()).toBe(true);
    await expect(await press.release()).toBe(false);
    await expect(driver.calls).toEqual(["down", "down", MOVE_OFF, "up"]);
  }),
  name: "Held Press Two Downs One Up",
};

// A release waits for a down still in flight, then lets go of the press,
// whether that down succeeds or rejects.
export const HeldPressPendingDownIsAwaited: Story = {
  ...recordCase(async () => {
    const landing = deferred();
    const driver = new FakeDriver().next("down", () => landing.promise);
    const press = new HeldPress(driver);
    const down = press.down();
    let released: boolean | undefined;
    const release = press.release().then((value) => {
      released = value;
    });
    await flush();
    await expect(released, "release waits for the down").toBe(undefined);
    await expect(driver.calls).toEqual(["down"]);
    landing.resolve();
    await down;
    await release;
    await expect(released).toBe(true);
    await expect(driver.calls).toEqual(["down", MOVE_OFF, "up"]);

    const refused = deferred();
    const driver2 = new FakeDriver().next("down", () => refused.promise);
    const press2 = new HeldPress(driver2);
    const down2 = press2.down();
    const release2 = press2.release();
    refused.reject(new Error("down rejected before dispatch"));
    await expect(down2).rejects.toThrow("down rejected");
    await expect(await release2).toBe(true);
    await expect(driver2.calls).toEqual(["down", MOVE_OFF, "up"]);
  }),
  name: "Held Press Pending Down Is Awaited",
};

// An up whose acknowledgement arrives late is waited for, and the release
// then finds nothing held: no second up.
export const HeldPressLateUpSendsNoSecondUp: Story = {
  ...recordCase(async () => {
    const ack = deferred();
    const driver = new FakeDriver().next("up", () => ack.promise);
    const press = new HeldPress(driver);
    await press.down();
    const up = press.up();
    let released: boolean | undefined;
    const release = press.release().then((value) => {
      released = value;
      return value;
    });
    await flush();
    try {
      await expect(released, "release waits for the up").toBe(undefined);
    } finally {
      ack.resolve();
    }
    await up;
    await expect(await release).toBe(false);
    await expect(driver.calls).toEqual(["down", "up"]);
  }),
  name: "Held Press Late Up Sends No Second Up",
};

// Two releases at once: the second rechecks after the first and sends
// nothing.
export const HeldPressOverlappingReleasesSendOneUp: Story = {
  ...recordCase(async () => {
    const driver = new FakeDriver();
    const press = new HeldPress(driver);
    await press.down();
    const results = await Promise.all([press.release(), press.release()]);
    await expect(results).toEqual([true, false]);
    await expect(driver.calls).toEqual(["down", MOVE_OFF, "up"]);
  }),
  name: "Held Press Overlapping Releases Send One Up",
};

// A release whose move rejects passes the rejection on and keeps the press
// held; the next release moves and lets go.
export const HeldPressFailedMoveIsRetried: Story = {
  ...recordCase(async () => {
    const driver = new FakeDriver();
    const press = new HeldPress(driver);
    await press.down();
    driver.rejectNext("move");
    await expect(press.release()).rejects.toThrow("move rejected");
    await expect(press.held, "still held after the failed move").toBe(true);
    await expect(await press.release()).toBe(true);
    await expect(driver.calls).toEqual(["down", MOVE_OFF, MOVE_OFF, "up"]);
  }),
  name: "Held Press Failed Move Is Retried",
};

// A rejected up, ordinary or in a release, keeps the press held for the
// next release.
export const HeldPressFailedUpIsRetried: Story = {
  ...recordCase(async () => {
    const driver = new FakeDriver().rejectNext("up").rejectNext("up");
    const press = new HeldPress(driver);
    await press.down();
    await expect(press.up()).rejects.toThrow("up rejected");
    await expect(press.held, "held after the failed up").toBe(true);
    await expect(press.release()).rejects.toThrow("up rejected");
    await expect(press.held, "held after the failed release").toBe(true);
    await expect(await press.release()).toBe(true);
    await expect(driver.calls).toEqual([
      "down",
      "up",
      MOVE_OFF,
      "up",
      MOVE_OFF,
      "up",
    ]);
  }),
  name: "Held Press Failed Up Is Retried",
};

// A newer down queued while an up's acknowledgement is late reaches the
// driver only after that up settles, so the older up does not clear the
// newer press.
export const HeldPressOlderUpKeepsNewerHold: Story = {
  ...recordCase(async () => {
    const ack = deferred();
    const driver = new FakeDriver().next("up", () => ack.promise);
    const press = new HeldPress(driver);
    await press.down();
    const up = press.up();
    const down = press.down();
    await flush();
    ack.resolve();
    await up;
    await down;
    await expect(press.held, "newer press held").toBe(true);
    await expect(await press.release()).toBe(true);
    await expect(driver.calls).toEqual(["down", "up", "down", MOVE_OFF, "up"]);
  }),
  name: "Held Press Older Up Keeps Newer Hold",
};

// Two pages keep separate records and queues: releasing an idle page sends
// nothing and does not wait for a down still in flight on the other.
export const HeldPressPagesAreIndependent: Story = {
  ...recordCase(async () => {
    const landing = deferred();
    const driverA = new FakeDriver().next("down", () => landing.promise);
    const driverB = new FakeDriver();
    const pressA = new HeldPress(driverA);
    const pressB = new HeldPress(driverB);
    const downA = pressA.down();
    let releasedB: boolean | undefined;
    const releaseB = pressB.release().then((value) => {
      releasedB = value;
    });
    await flush();
    try {
      await expect(
        releasedB,
        "B's release ends while A's down is pending"
      ).toBe(false);
    } finally {
      landing.resolve();
      await downA;
      await releaseB;
    }
    await expect(driverB.calls).toEqual([]);
    await expect(await pressA.release()).toBe(true);
    await expect(driverA.calls).toEqual(["down", MOVE_OFF, "up"]);
  }),
  name: "Held Press Pages Are Independent",
};
