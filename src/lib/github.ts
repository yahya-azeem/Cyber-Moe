export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  pushed_at: string;
  fork: boolean;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
    url: string;
  };
  payload: {
    action?: string;
    ref?: string;
    description?: string;
  };
  created_at: string;
}

// Fetch details for specific pinned repos
export async function fetchPinnedRepos(username: string = 'yahya-azeem'): Promise<GitHubRepo[]> {
  const repoNames = ['ShadPS5', 'Project-Golf-Ball', 'polymarket-copy-bot-rust', 'Unixy-System', 'Protection-Valley'];
  try {
    const reposData = await Promise.all(
      repoNames.map(async (name) => {
        const res = await fetch(`https://api.github.com/repos/${username}/${name}`);
        if (res.ok) {
          const repo: GitHubRepo = await res.json();
          return repo;
        }
        return null;
      })
    );
    return reposData.filter((r): r is GitHubRepo => r !== null);
  } catch (e) {
    console.error('Failed to fetch pinned repos:', e);
    return [];
  }
}

// Fetch all repos sorted by pushed time
export async function fetchActiveRepos(username: string = 'yahya-azeem'): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=15`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const data: GitHubRepo[] = await response.json();
    return data;
  } catch (e) {
    console.error('Failed to fetch github repos:', e);
    return [];
  }
}

// Fetch user public activity events
export async function fetchUserEvents(username: string = 'yahya-azeem'): Promise<GitHubEvent[]> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/events?per_page=10`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const data: GitHubEvent[] = await response.json();
    return data;
  } catch (e) {
    console.error('Failed to fetch github events:', e);
    return [];
  }
}
