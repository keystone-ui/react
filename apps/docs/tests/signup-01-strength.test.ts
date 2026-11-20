/**
 * signup-01's password strength score. It is a rough guide from length and
 * character variety, shown beside the field, never a security guarantee.
 */

import { describe, expect, it } from "vitest";

import { passwordStrength } from "@/demos/blocks/signup-01";

describe("passwordStrength", () => {
  it("returns null for an empty field, so no bar is shown", () => {
    expect(passwordStrength("")).toBeNull();
  });

  it.each([
    // Under the 8 characters the block asks for: never above Weak, however varied.
    ["a", "Weak"],
    ["Ab1!", "Weak"],
    ["Ab1!xyZ", "Weak"],
    // 8+ characters, one class of character.
    ["abcdefgh", "Weak"],
    // Two classes.
    ["abcdefg1", "Fair"],
    // Three classes.
    ["Abcdefg1", "Good"],
    // Four classes, but 8 to 11 characters stop at Good.
    ["Abcdefg1!", "Good"],
    ["Passw0rd!", "Good"],
    ["Abcdefg1!xy", "Good"],
    // Strong needs 12 or more characters with enough variety.
    ["Abcdefg1!xyz", "Strong"],
    ["abcdefghijkl", "Fair"],
    // Length makes up for variety: a long passphrase is strong.
    ["correct horse battery staple", "Strong"],
    // Repeating one or two characters is weak at any length.
    ["aaaaaaaaaaaaaaaaaaaa", "Weak"],
    ["abababababababab1", "Weak"],
    // Exactly three distinct characters is still weak.
    ["abcabcabcabcabcabcabc", "Weak"],
  ])("scores %j as %s", (password, label) => {
    expect(passwordStrength(password)?.label).toBe(label);
  });

  it("maps each label to a level and a status colour token", () => {
    expect(passwordStrength("abcdefgh")).toEqual({
      color: "destructive",
      label: "Weak",
      level: 1,
    });
    expect(passwordStrength("abcdefg1")).toEqual({
      color: "warning",
      label: "Fair",
      level: 2,
    });
    expect(passwordStrength("Abcdefg1")).toEqual({
      color: "success",
      label: "Good",
      level: 3,
    });
    expect(passwordStrength("Abcdefg1!xyz")).toEqual({
      color: "success",
      label: "Strong",
      level: 4,
    });
  });

  it("never drops while characters are typed onto the end", () => {
    const password = "Abcdefg1!correct horse";
    let previous = 0;
    for (let i = 1; i <= password.length; i++) {
      const level = passwordStrength(password.slice(0, i))?.level ?? 0;
      expect(level).toBeGreaterThanOrEqual(previous);
      previous = level;
    }
  });

  describe("counts characters, not UTF-16 units", () => {
    it.each([
      // Six code points (eight UTF-16 units): under the 8 the field asks for.
      ["Aa1!\u{1F600}\u{1F601}", "Weak"],
      ["Aa1!\u{1F600}\u{1F601}x", "Weak"],
      // Eight code points, four classes: Good, not Strong.
      ["Aa1!\u{1F600}\u{1F601}xy", "Good"],
      // 11 and 12 code points either side of the Strong cutoff.
      ["Aa1!\u{1F600}\u{1F601}xyzwv", "Good"],
      ["Aa1!\u{1F600}\u{1F601}xyzwvu", "Strong"],
      // 15 and 16 code points either side of the second length bonus
      // (two classes: lowercase and symbol).
      ["abcdefghijk\u{1F600}\u{1F601}\u{1F602}\u{1F603}", "Good"],
      ["abcdefghijkl\u{1F600}\u{1F601}\u{1F602}\u{1F603}", "Strong"],
      // Eight distinct emoji: eight characters of one class.
      [
        "\u{1F600}\u{1F601}\u{1F602}\u{1F603}\u{1F604}\u{1F605}\u{1F606}\u{1F607}",
        "Weak",
      ],
    ])("scores %j as %s", (password, label) => {
      expect(passwordStrength(password)?.label).toBe(label);
    });
  });

  describe("classifies letters and digits in any script", () => {
    it("rates Cyrillic like the same mix of Latin", () => {
      expect(passwordStrength("\u0410\u0430\u0411\u0431123!")).toEqual(
        passwordStrength("AaBb123!")
      );
      expect(passwordStrength("AaBb123!")?.label).toBe("Good");
    });

    it("counts an accented lowercase letter as lowercase, composed or not", () => {
      expect(passwordStrength("abcdefg\u00e9")?.label).toBe("Weak");
      expect(passwordStrength("abcdefge\u0301")?.label).toBe("Weak");
    });

    it("counts a non-ASCII decimal digit as a digit", () => {
      expect(passwordStrength("abcdefg\u0661!")).toEqual(
        passwordStrength("abcdefg1!")
      );
      expect(passwordStrength("abcdefg1!")?.label).toBe("Good");
    });

    it("counts an uncased script as letters, not symbols", () => {
      // Japanese: letters with no case, then one symbol.
      expect(
        passwordStrength(
          "\u65e5\u672c\u8a9e\u306e\u30d1\u30b9\u30ef\u30fc\u30c9!"
        )?.label
      ).toBe("Fair");
      expect(passwordStrength("abcdefghi!")?.label).toBe("Fair");
    });
  });

  it("a caller cannot change a later rating", () => {
    const first = passwordStrength("abc") as { label: string } | null;
    try {
      if (first) {
        first.label = "Strong";
      }
    } catch {
      // A frozen result may refuse the write; either way nothing leaks.
    }
    expect(passwordStrength("x")).toEqual({
      color: "destructive",
      label: "Weak",
      level: 1,
    });
  });
});
