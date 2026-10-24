/**
 * Build-time GitHub statistics for the changelog header.
 *
 * Plain module, no `use cache`: the component wraps `loadGitHubStats` in the
 * cached function so this logic can be tested with a fake `fetch`.
 */

export const GITHUB_REPO = "keystone-ui/react";

export interface GitHubStats {
  prCount: number;
  totalCommits: number;
  weeklyData: number[];
}

interface ParticipationData {
  all?: unknown;
}

interface SearchData {
  total_count?: unknown;
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Both responses must be 200 with the expected shape. GitHub answers 403
 * (rate limit: 60 requests an hour unauthenticated, shared across a CI
 * runner's IP) and 202 ("statistics are being computed") with bodies that
 * parse but carry no data. Reading those as "0 commits, 0 PRs" and caching
 * the result for a year would freeze a wrong headline for the whole deploy,
 * so this throws and the caller renders its neutral header instead.
 */
export async function loadGitHubStats(
  fetchImpl: typeof fetch = fetch,
  now: number = Date.now()
): Promise<GitHubStats> {
  const oneYearAgo = new Date(now - ONE_YEAR_MS).toISOString().slice(0, 10);

  const [participationRes, prRes] = await Promise.all([
    fetchImpl(
      `https://api.github.com/repos/${GITHUB_REPO}/stats/participation`
    ),
    fetchImpl(
      `https://api.github.com/search/issues?q=repo:${GITHUB_REPO}+type:pr+created:>${oneYearAgo}`
    ),
  ]);

  if (participationRes.status !== 200 || prRes.status !== 200) {
    throw new Error(
      `GitHub stats unavailable: participation ${participationRes.status}, search ${prRes.status}`
    );
  }

  const participation = (await participationRes.json()) as ParticipationData;
  const search = (await prRes.json()) as SearchData;

  if (
    !Array.isArray(participation.all) ||
    typeof search.total_count !== "number"
  ) {
    throw new Error("GitHub stats response has an unexpected shape");
  }

  const weeklyData = participation.all as number[];
  return {
    weeklyData,
    totalCommits: weeklyData.reduce((acc, count) => acc + count, 0),
    prCount: search.total_count,
  };
}
