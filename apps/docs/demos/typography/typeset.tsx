"use client";

/**
 * One class styles a whole block of rendered markdown or CMS HTML. Size,
 * leading and the gap between blocks come from three custom properties.
 */
export default function TypographyTypeset() {
  return (
    <article className="ks-typeset max-w-2xl">
      <h1>The Joke Tax Chronicles</h1>
      <p>
        Once upon a time, in a far-off land, there was a very lazy king who
        spent all day lounging on his throne. One day, his advisors came to him
        with a <a href="#problem">problem</a>: the kingdom was running out of
        money.
      </p>
      <h2>The King&apos;s Plan</h2>
      <p>
        The king thought long and hard, and finally came up with{" "}
        <strong>a brilliant plan</strong>: he would tax the jokes in the
        kingdom.
      </p>
      <blockquote>
        &ldquo;After all,&rdquo; he said, &ldquo;everyone enjoys a good joke, so
        it&apos;s only fair that they should pay for the privilege.&rdquo;
      </blockquote>
      <ul>
        <li>1st level of puns: 5 gold coins</li>
        <li>2nd level of jokes: 10 gold coins</li>
        <li>3rd level of one-liners: 20 gold coins</li>
      </ul>
      <p>
        Run <code>pnpm add @keystoneui/react</code> to get started.
      </p>
      <table>
        <thead>
          <tr>
            <th>King&apos;s Treasury</th>
            <th>People&apos;s happiness</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Empty</td>
            <td>Overflowing</td>
          </tr>
          <tr>
            <td>Overflowing</td>
            <td>Ecstatic</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}
