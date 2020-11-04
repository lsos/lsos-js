import { execCmd } from "./execCmd";

type GitCommand = string & { _brand?: "GitCommand" };
type GitCommandResult = {
  gitIsMissing: boolean;
  commandFailed: boolean;
  stdout: string;
};

export { runGitCommand };

async function runGitCommand(
  gitCommand: GitCommand
): Promise<GitCommandResult> {
  if (await gitIsMissing()) {
    return {
      stdout: "",
      commandFailed: true,
      gitIsMissing: true,
    };
  }

  const res = await execCmd(gitCommand);
  const { stdout } = res;

  if ("isError" in res) {
    return {
      stdout,
      commandFailed: true,
      gitIsMissing: false,
    };
  }

  return {
    stdout,
    commandFailed: false,
    gitIsMissing: false,
  };
}

async function gitIsMissing() {
  const res = await execCmd("git --version");
  return "isError" in res;
}
