import { exec, ExecException } from "child_process";
import assert = require("assert");

export { execCmd };

type ExecError = ExecException & {
  stdout: string;
  stderr: string;
};

function execCmd(cmd: string, options: { cwd?: string } = {}): Promise<string> {
  const { promise, resolvePromise, rejectPromise } = genPromise();

  exec(cmd, options, (err, stdout, stderr) => {
    if (err) {
      const execError: ExecError = {
        ...err,
        stdout,
        stderr,
      };
      rejectPromise(execError);
      return;
    }
    assert(stdout.constructor === String);
    resolvePromise(stdout);
    return;
  });

  return promise;
}

function genPromise() {
  let resolvePromise!: (value?: any) => void;
  let rejectPromise!: (value?: any) => void;
  const promise: Promise<any> = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });
  return { promise, resolvePromise, rejectPromise };
}
