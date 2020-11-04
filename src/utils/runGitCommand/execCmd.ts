import { exec, ExecException } from "child_process";
import assert = require("assert");

export { execCmd };

type ExecError = ExecException & {
  stdout: string;
  stderr: string;
};

function execCmd(cmd: string, options: { cwd?: string } = {}): Promise<string> {
  const { promise, resolvePromise, rejectPromise } = genPromise();

  const timeout = setTimeout(() => {
    console.error("Failed command: " + cmd);
    console.error(
      `[Lsos] A command call is is hanging. Open an issue at \`https://github.com/Lsos/lsos-js/issues/new\`. The command that is hanging is: \`${cmd}\`.`
    );
    process.exit();
  }, 0 * 1000);

  exec(cmd, options, (err, stdout, stderr) => {
    if (err) {
      const execError: ExecError = {
        ...err,
        stdout,
        stderr,
      };
      clearTimeout(timeout);
      rejectPromise(execError);
      return;
    }
    assert(stdout.constructor === String);
    clearTimeout(timeout);
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
