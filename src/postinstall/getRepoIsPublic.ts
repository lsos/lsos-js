import { runGitCommand } from "../utils/runGitCommand";
import { splitByLine, splitByWhitespace } from "../utils/split";
import assert = require("assert");

export { getRepoIsPublic };

type OrgName = string & { _brand?: "OrgName" };
type RepoName = string & { _brand?: "RepoName" };
type RepoUrl = string & { _brand?: "RepoUrl" };
type GitHubRepo = {
  orgName: OrgName;
  repoName: RepoName;
  repoUrl: RepoUrl;
};
type RepoInfo = {
  isPublic: null | true | false;
  orgName: null | OrgName;
  repoName: null | RepoName;
  repoUrl: null | RepoUrl;
  cwd: string;
};

async function getRepoIsPublic(): Promise<RepoInfo> {
  const repo = await getGithubRepo();
  assert(repo === null || (repo.orgName && repo.repoName));
  const orgName = repo && repo.orgName;
  const repoName = repo && repo.repoName;
  const repoUrl = repo && repo.repoUrl;

  let isPublic = null;
  if (repo) {
    isPublic = await repoIsPublic(repo);
    assert([true, false, null].includes(isPublic));
  }

  const cwd = process.cwd();

  return {
    isPublic,
    repoUrl,
    orgName,
    repoName,
    cwd,
  };
}

async function repoIsPublic(repo: GitHubRepo): Promise<boolean | null> {
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos.git
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos-demo
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos-demo.git
  const { orgName, repoName } = repo;
  const { gitIsMissing, commandFailed } = await runGitCommand(
    `git ls-remote https://fakeuser:fakepassword@github.com/${orgName}/${repoName}`
  );

  if (gitIsMissing) {
    return null;
  }
  if (commandFailed) {
    return false;
  }
  return true;
}

async function getGithubRepo(): Promise<GitHubRepo | null> {
  // git remote get-url --all origin
  // git remote -v
  // git config --get remote.origin.url
  const { gitIsMissing, commandFailed, stdout } = await runGitCommand(
    "git remote -v"
  );
  if (gitIsMissing || commandFailed) {
    return null;
  }
  return findGitHubRepo(stdout);
}

function findGitHubRepo(text: string): GitHubRepo | null {
  test();

  return find(text);

  function test() {
    [
      // git remote -v
      `origin	git@github.com:Lsos/utils (fetch)
  origin	git@github.com:Lsos/utils (push)`,
      // git config --get remote.origin.url
      // git remote get-url --all origin
      `git@github.com:Lsos/utils`,
      // Edge cases
      `https://github.com/Lsos/utils`,
      `https://github.com/Lsos/utils/`,
      `git@github.com:Lsos/utils.git/`,
    ].forEach((testString) => {
      const repo = find(testString);
      assert(repo);
      const { orgName, repoName } = repo;
      assert(orgName === "Lsos");
      assert(["utils", "utils.git"].includes(repoName));
    });
  }

  function find(text: string): GitHubRepo | null {
    // Lazy implementation:
    //  - We only consider the first encountered GitHub URL
    //  - We assume the GitHub URL to end with `orgName/repoName` (`repoName` ending with `.git` is fine)
    for (const line of splitByLine(text)) {
      for (const repoUrl of splitByWhitespace(line)) {
        if (repoUrl.includes("github.com")) {
          const segments = repoUrl.split(/\/|:/).filter(Boolean);
          const orgName = segments.slice(-2, -1)[0];
          const repoName = segments.slice(-1)[0];
          if (orgName && repoName) {
            return { orgName, repoName, repoUrl };
          }
        }
      }
    }

    return null;
  }
}
