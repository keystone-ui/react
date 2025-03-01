import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "w-fit inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group border",
  {
    variants: {
      variant: {
        default: 'bg-transparent text-foreground border-border',
        red: 'bg-red-500/15 text-red-700 border-transparent group-data-hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:group-data-hover:bg-red-500/20',
        orange: 'bg-orange-500/15 text-orange-700 border-transparent group-data-hover:bg-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400 dark:group-data-hover:bg-orange-500/20',
        amber: 'bg-amber-400/20 text-amber-700 border-transparent group-data-hover:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:group-data-hover:bg-amber-400/15',
        yellow: 'bg-yellow-400/20 text-yellow-700 border-transparent group-data-hover:bg-yellow-400/30 dark:bg-yellow-400/10 dark:text-yellow-300 dark:group-data-hover:bg-yellow-400/15',
        lime: 'bg-lime-400/20 text-lime-700 border-transparent group-data-hover:bg-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300 dark:group-data-hover:bg-lime-400/15',
        green: 'bg-green-500/15 text-green-700 border-transparent group-data-hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:group-data-hover:bg-green-500/20',
        emerald: 'bg-emerald-500/15 text-emerald-700 border-transparent group-data-hover:bg-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400 dark:group-data-hover:bg-emerald-500/20',
        teal: 'bg-teal-500/15 text-teal-700 border-transparent group-data-hover:bg-teal-500/25 dark:bg-teal-500/10 dark:text-teal-300 dark:group-data-hover:bg-teal-500/20',
        cyan: 'bg-cyan-400/20 text-cyan-700 border-transparent group-data-hover:bg-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 dark:group-data-hover:bg-cyan-400/15',
        sky: 'bg-sky-500/15 text-sky-700 border-transparent group-data-hover:bg-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:group-data-hover:bg-sky-500/20',
        blue: 'bg-blue-500/15 text-blue-700 border-transparent group-data-hover:bg-blue-500/25 dark:text-blue-400 dark:group-data-hover:bg-blue-500/25',
        indigo: 'bg-indigo-500/15 text-indigo-700 border-transparent group-data-hover:bg-indigo-500/25 dark:text-indigo-400 dark:group-data-hover:bg-indigo-500/20',
        violet: 'bg-violet-500/15 text-violet-700 border-transparent group-data-hover:bg-violet-500/25 dark:text-violet-400 dark:group-data-hover:bg-violet-500/20',
        purple: 'bg-purple-500/15 text-purple-700 border-transparent group-data-hover:bg-purple-500/25 dark:text-purple-400 dark:group-data-hover:bg-purple-500/20',
        fuchsia: 'bg-fuchsia-400/15 text-fuchsia-700 border-transparent group-data-hover:bg-fuchsia-400/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-400 dark:group-data-hover:bg-fuchsia-400/20',
        pink: 'bg-pink-400/15 text-pink-700 border-transparent group-data-hover:bg-pink-400/25 dark:bg-pink-400/10 dark:text-pink-400 dark:group-data-hover:bg-pink-400/20',
        rose: 'bg-rose-400/15 text-rose-700 border-transparent group-data-hover:bg-rose-400/25 dark:bg-rose-400/10 dark:text-rose-400 dark:group-data-hover:bg-rose-400/20',
        slate: 'bg-slate-600/10 text-slate-700 border-transparent group-data-hover:bg-slate-600/20 dark:bg-white/5 dark:text-slate-400 dark:group-data-hover:bg-white/10',
        gray: 'bg-gray-600/10 text-gray-700 border-transparent group-data-hover:bg-gray-600/20 dark:bg-white/5 dark:text-gray-400 dark:group-data-hover:bg-white/10',
        zinc: 'bg-zinc-600/10 text-zinc-700 border-transparent group-data-hover:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:group-data-hover:bg-white/10',
        neutral: 'bg-neutral-600/10 text-neutral-700 border-transparent group-data-hover:bg-neutral-600/20 dark:bg-white/5 dark:text-neutral-400 dark:group-data-hover:bg-white/10',
        stone: 'bg-stone-600/10 text-stone-700 border-transparent group-data-hover:bg-stone-600/20 dark:bg-white/5 dark:text-stone-400 dark:group-data-hover:bg-white/10',
      },
      size: {
        default: "text-xs px-2 h-5",
        xs: "text-[0.625rem] px-2 h-4",
        sm: "text-xs px-3 h-6",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
);

export type BadgeVariantsProps = VariantProps<typeof badgeVariants>; 