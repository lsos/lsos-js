import { getEnv } from "./env/getEnv";
import { assertUsage } from "./utils/assertUsage";

export { verify };

type ProjectInfo = {
  projectName: string;
  npm: string;
};

function verify({
  projectName,
  npm,
  minNumberOfAuthors = 3,
  trustMode = false,
  freeTrialDays = 7,
  debug = false,
}: ProjectInfo & {
  minNumberOfAuthors?: number;
  trustMode?: boolean;
  freeTrialDays?: number;
  debug?: boolean;
}) {
  assertUsage(npm, "Argument `npm` is missing.");
  assertUsage(projectName, "Argument `projectName` is missing.");
  assertUsage(trustMode !== undefined, "Argument `trustMode` is missing.");
  assertUsage(
    [true, false].includes(trustMode),
    "Argument `trustMode` should be `true` or `false`."
  );

  if (debug) debugLog(npm, minNumberOfAuthors);

  if (
    isDev() &&
    (getNumberOfAuthors() || 0) >= minNumberOfAuthors &&
    !repoIsPublic() &&
    !isActivated(npm) &&
    !isFreeTrial(freeTrialDays)
  ) {
    const msg = callToActivate({ projectName, npm });
    if (!trustMode) {
      throw msg;
    } else {
      console.warn(msg);
    }
  }
}

function isActivated(npm: string): boolean | null {
  const env = getEnv();

  // postinstall script wasn't run
  if (!env) return null;

  const { expirationDates } = env.activation;
  const expirationDate: number = expirationDates[npm];
  if (!expirationDate) {
    return false;
  }
  return expirationDate >= new Date().getTime();
}

function repoIsPublic(): boolean | null {
  const env = getEnv();

  // postinstall script wasn't run
  if (!env) return null;

  return env.repo.isPublic;
}

function getNumberOfAuthors(): number | null {
  const env = getEnv();

  // postinstall script wasn't run
  if (!env) return null;

  return env.repo.numberOfAuthors;
}

function callToActivate({ projectName, npm }: ProjectInfo): string {
  return [
    `You need an activation key to use ${projectName}.`,
    `Get your (free) activation key at ${activationUrl(npm)}`,
  ].join(" ");
}

function activationUrl(npm: string): string {
  return `https://lsos.org/npm/${npm}/activate`;
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

function isFreeTrial(freeTrialDays: number): boolean {
  // TODO
  return false;
}

function debugLog(npm: string, minNumberOfAuthors: number): void {
  console.log({
    isDev: isDev(),
    isActivated: isActivated(npm),
    numberOfAuthors: getNumberOfAuthors(),
    repoIsPublic: repoIsPublic(),
    minNumberOfAuthors,
    npm,
  });
}
