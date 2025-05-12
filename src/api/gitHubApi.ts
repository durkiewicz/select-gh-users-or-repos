import { combineArrays } from '../utils/combineResults';

const limit = 50;

type RequestOptions = {
  apiToken: string | undefined;
  query: string;
  abortSignal?: AbortSignal;
};

export async function getCombinedUsersAndRepos(options: RequestOptions) {
  // Promise.all is used because it is decided to reject the entire thing when any of the requests fail.
  // If you're interested in a partial result, you can use Promise.allSettled and handle the results accordingly.
  const [users, repos] = await Promise.all([
    getUsers(options),
    getRepositories(options),
  ]);

  return combineArrays({
    arrays: [
      repos.map((x) => ({
        id: x.id,
        name: x.name,
        url: x.svn_url,
        type: 'repository',
      })),
      users.map((x) => ({
        id: x.id,
        name: x.login,
        url: x.html_url,
        type: 'user',
      })),
    ],
    sortBy: 'name',
    limit,
  });
}

function getUsers(options: RequestOptions) {
  return getApiItems<{ id: number; login: string; html_url: string }>(
    'users',
    options,
  );
}

function getRepositories(options: RequestOptions) {
  return getApiItems<{ id: number; name: string; svn_url: string }>(
    'repositories',
    options,
  );
}

async function getApiItems<T>(
  type: 'users' | 'repositories',
  { apiToken, query, abortSignal }: RequestOptions,
): Promise<T[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (apiToken) {
    headers.Authorization = `Bearer ${apiToken}`;
  }
  const searchParams = new URLSearchParams({
    q: query,
    per_page: String(limit),
  });
  const response = await fetch(
    `https://api.github.com/search/${type}?${searchParams}`,
    {
      headers,
      signal: abortSignal,
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type}`);
  }
  const json = await response.json();
  if (typeof json !== 'object' || !json.items) {
    throw new Error('Invalid response');
  }
  return json.items;
}
