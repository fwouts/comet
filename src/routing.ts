export function producePath(
  owner: string,
  repo: string,
  selectedRefName?: string,
  compareToRefName?: string
) {
  let path = `/${owner}/${repo}`;
  if (selectedRefName && compareToRefName) {
    path += `/${selectedRefName}:${compareToRefName}`;
  }
  return path;
}

export function parsePath(path: string): ParsedPath {
  const [, owner, repo, ...rest] = path.split("/");
  if (!owner || !repo) {
    return null;
  }
  const refs = rest.join("/").split(":");
  if (refs.length === 2) {
    return {
      kind: "repo-and-comparison",
      owner,
      repo,
      selectedRefName: refs[0],
      compareToRefName: refs[1]
    };
  }
  return {
    kind: "repo-only",
    owner,
    repo
  };
}

export type ParsedPath =
  | {
      kind: "repo-only";
      owner: string;
      repo: string;
    }
  | {
      kind: "repo-and-comparison";
      owner: string;
      repo: string;
      selectedRefName: string;
      compareToRefName: string;
    }
  | null;
