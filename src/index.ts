import { expirationDates } from "./env/expirationDates";
import { numberOfAuthors } from "./env/numberOfAuthors";
import { assertUsage } from "./utils/assertUsage";

export { isActivated };
export { callToActivate };
export { activationUrl };
export { numberOfGitAuthors };
export { isDev };

function isActivated(npmName: string): boolean {
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

function numberOfGitAuthors(): number {
  if (numberOfAuthors === undefined) {
    // postinstall script wasn't run
    return 0;
  }
  if (numberOfAuthors === null) {
    return 0;
  }
  //@ts-ignore
  return numberOfAuthors;
}

function callToActivate({
  projectName,
  npmName,
}: {
  projectName: string;
  npmName: string;
}): string {
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
