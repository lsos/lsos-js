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
  try {
    await execCmd("git --version");
  } catch (err) {
    return {
      gitIsMissing: true,
      commandFailed: true,
      stdout: "",
    };
  }

  try {
    const stdout = await execCmd(gitCommand);
    return {
      stdout,
      commandFailed: false,
      gitIsMissing: false,
    };
  } catch (err) {
    const { stdout } = err;
    return {
      stdout,
      commandFailed: true,
      gitIsMissing: false,
    };
  }
}
