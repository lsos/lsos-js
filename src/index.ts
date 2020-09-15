import { expirationDates } from "./env/expirationDates";
import { numberOfAuthors as numberOfAuthorsData } from "./env/numberOfAuthors";
import { assertUsage } from "./utils/assertUsage";

export { verifyActivation };

export { isActivated };
export { callToActivate };
export { activationUrl };
export { numberOfAuthors };
export { isDev };

type ProjectInfo = {
  projectName: string;
  npmName: string;
};

function verifyActivation({
  projectName,
  npmName,
  minNumberOfAuthor = 3,
}: ProjectInfo & { minNumberOfAuthor: number }) {
  assertUsage(npmName, "Argument `npmName` is missing.");
  assertUsage(projectName, "Argument `npmName` is missing.");

  /*
  {
    const _isDev = isDev();
    const _numberOfAuthors = numberOfAuthors();
    const _isActivated = isActivated({ npmName });
    console.log({
      _isDev,
      _numberOfAuthors,
      _isActivated,
      npmName,
      projectName,
      minNumberOfAuthor,
    });
  }
  //*/

  if (
    isDev() &&
    numberOfAuthors() >= minNumberOfAuthor &&
    !isActivated({ npmName })
  ) {
    throw callToActivate({ projectName, npmName });
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

function numberOfAuthors(): number {
  if (numberOfAuthorsData === undefined) {
    // postinstall script wasn't run
    return 0;
  }
  if (numberOfAuthorsData === null) {
    return 0;
  }
  //@ts-ignore
  return numberOfAuthorsData;
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
