import { Skeleton } from "@keystoneui/react/skeleton";

import { cn } from "@/lib/cn";

const REPO = "keystone-ui/react";
const REVALIDATE_SECONDS = 86_400;

interface ParticipationData {
  all: number[];
  owner: number[];
}

type ActivityLevel = 0 | 1 | 2 | 3 | 4;

const ACTIVITY_COLORS: Record<ActivityLevel, string> = {
  0: "bg-muted/30",
  1: "bg-emerald-500/20",
  2: "bg-emerald-500/40",
  3: "bg-emerald-500/60",
  4: "bg-emerald-500/80",
};

function getActivityLevel(count: number, max: number): ActivityLevel {
  if (count === 0) {
    return 0;
  }
  const ratio = count / max;
  if (ratio <= 0.25) {
    return 1;
  }
  if (ratio <= 0.5) {
    return 2;
  }
  if (ratio <= 0.75) {
    return 3;
  }
  return 4;
}

async function fetchGitHubStats(): Promise<{
  weeklyData: number[];
  totalCommits: number;
  prCount: number;
}> {
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [participationRes, prRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${REPO}/stats/participation`, {
      next: { revalidate: REVALIDATE_SECONDS },
    }),
    fetch(
      `https://api.github.com/search/issues?q=repo:${REPO}+type:pr+created:>${oneYearAgo}`,
      { next: { revalidate: REVALIDATE_SECONDS } }
    ),
  ]);

  const participation: ParticipationData = await participationRes.json();
  const prData = await prRes.json();

  const weeklyData = participation.all ?? [];
  const totalCommits = weeklyData.reduce((acc, count) => acc + count, 0);
  const prCount = prData.total_count ?? 0;

  return { weeklyData, totalCommits, prCount };
}

function ActivityCell({
  count,
  maxCount,
  weekIndex,
  dayIndex,
}: {
  count: number;
  maxCount: number;
  weekIndex: number;
  dayIndex: number;
}) {
  const level = getActivityLevel(count, maxCount);

  return (
    <div
      className={cn(
        "aspect-square w-full border-[0.5px] border-background border-dashed transition-colors hover:bg-emerald-500",
        ACTIVITY_COLORS[level],
        level === 0 && "border-border/30"
      )}
      title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}: ${count} commit${
        count === 1 ? "" : "s"
      }`}
    />
  );
}

export function GitHubActivityGraphSkeleton() {
  return (
    <div className="flex flex-col gap-6 pt-3 pb-12">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid w-full grid-flow-col grid-cols-52 grid-rows-7 gap-0.5">
        {Array.from({ length: 52 * 7 }).map((_, i) => (
          <div
            className="aspect-square w-full animate-pulse bg-accent"
            key={`activity-skeleton-${i.toString()}`}
          />
        ))}
      </div>
    </div>
  );
}

export async function GitHubActivityGraph() {
  try {
    const { weeklyData, totalCommits, prCount } = await fetchGitHubStats();

    const dailyData: number[][] = weeklyData.map((weekTotal) => {
      const days: number[] = [];
      let remaining = weekTotal;

      for (let day = 0; day < 7; day++) {
        if (day === 6) {
          days.push(remaining);
        } else {
          const portion = Math.floor(remaining / (7 - day));
          days.push(portion);
          remaining -= portion;
        }
      }
      return days;
    });

    const maxDailyCommits = Math.max(...dailyData.flat(), 1);

    return (
      <div className="flex flex-col gap-6 pt-3 pb-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-4xl tracking-tight">Changelog</h1>
          <p className="text-muted-foreground">
            We&apos;re shipping a lot,{" "}
            <span className="font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
              {totalCommits.toLocaleString()} commit
              {totalCommits === 1 ? "" : "s"}
            </span>{" "}
            and{" "}
            <span className="font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
              {prCount.toLocaleString()} PR{prCount === 1 ? "" : "s"}
            </span>{" "}
            in the past year.
          </p>
        </div>

        <div className="relative w-full">
          <div className="grid w-full grid-flow-col grid-cols-52 grid-rows-7 gap-0.5">
            {dailyData.map((week, weekIndex) =>
              week.map((dayCount, dayIndex) => (
                <ActivityCell
                  count={dayCount}
                  dayIndex={dayIndex}
                  key={`activity-cell-${weekIndex.toString()}-${dayIndex.toString()}`}
                  maxCount={maxDailyCommits}
                  weekIndex={weekIndex}
                />
              ))
            )}
          </div>
          <div className="mt-2 flex items-center justify-end gap-2 text-muted-foreground text-xs">
            <span>Less</span>
            <div className="flex gap-0.5">
              {([0, 1, 2, 3, 4] as ActivityLevel[]).map((level) => (
                <div
                  className={cn(
                    "size-2.5 border border-dashed",
                    ACTIVITY_COLORS[level],
                    level === 0 && "border-border/30"
                  )}
                  key={level}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="flex flex-col gap-2 pb-12">
        <h1 className="font-bold text-4xl tracking-tight">Changelog</h1>
        <p className="text-muted-foreground">
          All notable changes to Keystone UI are documented here.
        </p>
      </div>
    );
  }
}
