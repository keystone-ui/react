import { BottomNav } from "@/components/bottom-nav";

// To change the destinations, pass `items` with each icon as an element:
// `items={[{ href: "/home", icon: <Home />, label: "Home" }, …]}`. An element
// can cross from this Server Component to the client BottomNav; the bare
// component (`icon: Home`) cannot.
export default function Page() {
  return (
    <>
      {/* Ordinary document scrolling. Below md the page reserves exactly the
          bar's height plus the safe area, so the last row ends above it; the
          bar itself keeps a focused control clear of it. */}
      <main className="pb-[calc(var(--bottom-nav-height,4rem)+env(safe-area-inset-bottom))] md:pb-0 print:pb-0">
        <div className="mx-auto w-full max-w-2xl p-4">
          <h1 className="font-semibold text-lg">Home</h1>
        </div>
      </main>
      <BottomNav currentHref="/home" />
    </>
  );
}
