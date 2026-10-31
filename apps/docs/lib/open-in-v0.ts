/**
 * "Open in v0" links for component and block previews.
 *
 * v0 fetches the registry item by URL, so the item must be the deployed one:
 * the site URL defaults to production and a preview deploy can point it at
 * itself with NEXT_PUBLIC_APP_URL. Set NEXT_PUBLIC_V0_URL to an empty string
 * to hide the button.
 *
 * Every component carries its base.css tokens inline as fallbacks
 * (`z-(--z-modal,50)`), because v0 loads no base.css — without them a modal
 * opened in v0 would have `z-index: auto`.
 */

const DEFAULT_V0_URL = "https://v0.dev";
const DEFAULT_APP_URL = "https://keystoneui.io";

export function openInV0Href(
  registryName: string,
  env: { appUrl?: string; v0Url?: string } = {
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    v0Url: process.env.NEXT_PUBLIC_V0_URL,
  }
): string | undefined {
  const v0Url = env.v0Url ?? DEFAULT_V0_URL;
  if (v0Url === "") {
    return;
  }
  const appUrl = env.appUrl || DEFAULT_APP_URL;
  const itemUrl = `${appUrl}/r/${registryName}.json`;
  return `${v0Url}/chat/api/open?url=${encodeURIComponent(itemUrl)}`;
}
