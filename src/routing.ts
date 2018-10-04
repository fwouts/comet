export function producePath(owner: string, repo: string) {
  return `/${owner}/${repo}`;
}

export function parsePath(path: string): ParsedPath {
  const [, owner, repo] = path.split("/");
  if (!owner || !repo) {
    return null;
  }
  return {
    owner,
    repo
  };
}

export type ParsedPath = {
  owner: string;
  repo: string;
} | null;
