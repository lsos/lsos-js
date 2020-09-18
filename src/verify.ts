import { expirationDates } from "./env/expirationDates";
import { numberOfAuthors as numberOfAuthors_data } from "./env/numberOfAuthors";
import { assertUsage } from "./utils/assertUsage";

export { verify };

export { isActivated };
export { callToActivate };
export { activationUrl };
export { numberOfActiveAuthors };
export { isDev };

type ProjectInfo = {
  projectName: string;
  npmName: string;
};

function verify({
  projectName,
  npmName,
  numberOfAuthors = 3,
  onlyWarning = false,
  freeTrial = 0,
}: ProjectInfo & {
  numberOfAuthors: number;
  onlyWarning: boolean;
  freeTrial: number;
}) {
  assertUsage(npmName, "Argument `npmName` is missing.");
  assertUsage(projectName, "Argument `npmName` is missing.");
  assertUsage(onlyWarning !== undefined, "Argument `onlyWarning` is missing.");
  assertUsage(
    [true, false].includes(onlyWarning),
    "Argument `onlyWarning` should be `true` or `false`."
  );

  /*
  {
    const _isDev = isDev();
    const _numberOfAuthors = numberOfActiveAuthors();
    const _isActivated = isActivated({ npmName });
    console.log({
      _isDev,
      _numberOfAuthors,
      _isActivated,
      npmName,
      projectName,
      numberOfAuthors,
    });
  }
  //*/

  if (
    isDev() &&
    numberOfActiveAuthors() >= numberOfAuthors &&
    !isActivated({ npmName }) &&
    !isFreeTrial(freeTrial)
  ) {
    const msg = callToActivate({ projectName, npmName });
    if (!onlyWarning && blockUser()) {
      throw msg;
    } else {
      console.warn(msg);
    }
  }
}

function isActivated({ npmName }: { npmName: string }): boolean {
  assertUsage(npmName, "Argument `npmName` is missing.");
  if (expirationDates === undefined) {
    // postinstall script wasn't run
    return true;
  }
  //@ts-ignore
  const expirationDate: number = expirationDates[npmName];
  if (!expirationDate) {
    return false;
  }
  return expirationDate >= new Date().getTime();
}

function numberOfActiveAuthors(): number {
  if (numberOfAuthors_data === undefined) {
    // postinstall script wasn't run
    return 0;
  }
  if (numberOfAuthors_data === null) {
    return 0;
  }
  //@ts-ignore
  return numberOfAuthors_data;
}

function callToActivate({ projectName, npmName }: ProjectInfo): string {
  assertUsage(npmName, "Argument `npmName` is missing.");
  assertUsage(projectName, "Argument `npmName` is missing.");
  return [
    `You need an activation key to use ${projectName}.`,
    `Get your (free) activation key at ${activationUrl(npmName)}`,
  ].join(" ");
}

function activationUrl(npmName: string): string {
  assertUsage(npmName, "Argument `npmName` is missing.");
  return `https://lsos.org/npm/${npmName}/activate`;
}

function isDev() {
  if (typeof window !== "undefined" && window?.location?.hostname) {
    return window.location.hostname === "localhost";
  }

  if (typeof process !== "undefined" && process?.env) {
    return !["staging", "production", "test", "tests", "ci"].includes(
      process.env.NODE_ENV || ""
    );
  }

  return false;
}

function isFreeTrial(freeTrial: number): boolean {
  // TODO
  return false;
}

function blockUser() {
  // TODO
  return false;
}
