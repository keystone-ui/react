/**
 * The record of a primary-button press sent by the custom `pointerDown`
 * command on one Playwright page, and the release of a press a play left
 * held. It covers that command only: input from `userEvent`, a wheel, or the
 * Storybook addon's own pointer reset is not recorded, and a command an
 * expired play sends later is not stopped.
 *
 * Plain code with no browser import: the page's mouse is passed in as three
 * calls, so the record can be driven by a fake.
 */

/** The three mouse calls the record needs, as Playwright's `page.mouse` gives them. */
export interface PressDriver {
  down: () => Promise<void>;
  move: (x: number, y: number) => Promise<void>;
  up: () => Promise<void>;
}

/** A point outside the page's viewport, where the pointer hovers nothing. */
export const OFFSCREEN = { x: -1000, y: -1000 } as const;

export class HeldPress {
  readonly #driver: PressDriver;
  /**
   * Whether a down has been sent, resolved or rejected, with no successful up
   * or release since. Playwright tracks one primary button, so two downs are
   * still one press and one up lets go of it.
   */
  #held = false;
  /**
   * Every down, up and release on this page runs after the one before it has
   * settled, so a release waits for a down, an up or another release still
   * in flight and then reads the record they left: a release that follows a
   * successful release, with no down between them, finds nothing held and
   * sends nothing.
   */
  #queue: Promise<unknown> = Promise.resolve();

  constructor(driver: PressDriver) {
    this.#driver = driver;
  }

  /**
   * Whether the record holds a press. True from the moment a down is sent to
   * the driver, so also while that down is still in flight.
   */
  get held() {
    return this.#held;
  }

  #run<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.#queue.then(operation, operation);
    this.#queue = result.catch(() => undefined);
    return result;
  }

  /**
   * Sends a down and marks the press held before the driver answers, so a
   * down that rejects still counts as held; the rejection is passed on. A
   * rejection does not show whether the button went down: Playwright marks
   * its own button pressed before it sends anything to the browser. If the
   * button was already up and a rejected down never reached the page,
   * immediate recovery may send one unnecessary up offscreen. We accept that
   * extra up to avoid leaving a button pressed when delivery is uncertain.
   */
  down(): Promise<void> {
    return this.#run(async () => {
      this.#held = true;
      await this.#driver.down();
    });
  }

  /**
   * Sends an up, held or not, as the command always has. Only an up that
   * succeeds clears the record. A rejected up preserves the prior record, so
   * if it released a recorded hold and its acknowledgement was lost, an
   * immediately following release retries the up after moving offscreen,
   * with the button already up.
   */
  up(): Promise<void> {
    return this.#run(async () => {
      await this.#driver.up();
      this.#held = false;
    });
  }

  /**
   * Lets go of a held press: moves the pointer to `OFFSCREEN`, then sends an
   * up, and resolves true. Sends nothing and resolves false when no press is
   * held once the operations queued before it have settled. If the move or
   * the up rejects, the press stays held and the rejection is passed on, so
   * the caller sees it and a later release tries again.
   */
  release(): Promise<boolean> {
    return this.#run(async () => {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: a down settled earlier in the queue may have set it
      if (!this.#held) {
        return false;
      }
      await this.#driver.move(OFFSCREEN.x, OFFSCREEN.y);
      await this.#driver.up();
      this.#held = false;
      return true;
    });
  }
}
