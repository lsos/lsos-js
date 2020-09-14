import { expirationDates } from "./env/expirationDates";
import { numberOfAuthors } from "./env/numberOfAuthors";

export { isActivated };
export { numberOfGitAuthors };
export { activationUrl };
export { getCallToActivate };

function isActivated(npmName: string): boolean {
  if (expirationDates === undefined) {
    // postinstall script wasn't run
    return true;
  }
  //@ts-ignore
  const expirationDate: Date = expirationDates[npmName];
  if (expirationDate === null) {
    return true;
  }
  return expirationDate >= new Date();
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

function getCallToActivate({
  projectName,
  npmName,
}: {
  projectName: string;
  npmName: string;
}): string {
  return [
    `You need an activation key to use ${projectName}.`,
    `Get your (free) activation key at ${activationUrl(npmName)}`,
  ].join(" ");
}

function activationUrl(npmName: string): string {
  return `https://lsos.org/npm/${npmName}/activate`;
}
