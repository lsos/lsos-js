import { runGitCommand } from "../../utils/runGitCommand";
import { splitByLine, splitByWhitespace } from "../../utils/split";
import assert = require("assert");

export { checkIfRepoIsPublic };

type GitHubRepo = {
  username: string & { _brand?: "username" };
  repository: string & { _brand?: "repository" };
};

async function checkIfRepoIsPublic(): Promise<boolean | null> {
  const repo = await getGithubRepo();
  if (repo === null) {
    return null;
  }
  assert(repo.username && repo.repository);

  const isPublic = await repoIsPublic(repo);
  if (isPublic === null) {
    return null;
  }
  assert([true, false].includes(isPublic));

  return isPublic;
}

async function repoIsPublic(repo: GitHubRepo): Promise<boolean | null> {
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos.git
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos-demo
  // git ls-remote https://fakeuser:fakepassword@github.com/Lsos/lsos-demo.git
  const { username, repository } = repo;
  const { gitIsMissing, commandFailed } = await runGitCommand(
    `git ls-remote https://fakeuser:fakepassword@github.com/${username}/${repository}`
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
  const { gitIsMissing, stdout } = await runGitCommand("git remote -v");
  if (gitIsMissing) {
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
      const { username, repository } = repo;
      assert(username === "Lsos");
      assert(["utils", "utils.git"].includes(repository));
    });
  }

  function find(text: string): GitHubRepo | null {
    // Lazy implementation:
    //  - We only consider the first encountered GitHub URL
    //  - We assume the GitHub URL to end with `username/repository` (`repository` ending with `.git` is fine)
    for (const line of splitByLine(text)) {
      for (const word of splitByWhitespace(line)) {
        if (word.includes("github.com")) {
          const segments = word.split("/").filter(Boolean);
          const username = segments.slice(-2, -1)[0];
          const repository = segments.slice(-1)[0];
          if (username && repository) {
            return { username, repository };
          }
        }
      }
    }

    return null;
  }
}
