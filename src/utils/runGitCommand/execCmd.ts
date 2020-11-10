import { exec, ExecException } from "child_process";
import assert = require("assert");
const { repository, name } = require("../../../package.json");

export { execCmd };

type ExecResult = {
  stdout: string;
};
type ExecError = ExecException &
  ExecResult & {
    isError: true;
    stderr: string;
  };

function execCmd(
  cmd: string,
  options: { cwd?: string } = {}
): Promise<ExecError | ExecResult> {
  const { promise, resolvePromise } = genPromise<ExecError | ExecResult>();

  const timeout = setTimeout(() => {
    console.error(
      `[${name}] Command call is hanging. Open an issue at \`${repository}/issues/new\`. The command that is hanging is: \`${cmd}\`.`
    );
    process.exit();
  }, 5 * 1000);

  exec(cmd, options, (err, stdout, stderr) => {
    if (err) {
      const execError: ExecError = {
        ...err,
        isError: true,
        stdout,
        stderr,
      };
      clearTimeout(timeout);
      resolvePromise(execError);
      return;
    }
    assert(stdout.constructor === String);
    clearTimeout(timeout);
    resolvePromise({ stdout });
    return;
  });

  return promise;
}

function genPromise<T>() {
  let resolvePromise!: (value?: T) => void;
  let rejectPromise!: (value?: T) => void;
  const promise: Promise<T> = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolvePromise, rejectPromise };
}
