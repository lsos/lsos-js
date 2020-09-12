/*
import { UserConfig } from "../UserConfig";
import { splitByLine } from "../utils/split";
*/
import { symbolInfo, symbolSuccess, stylePath } from "@lsos/utils";
import { writeFileSync, readFileSync } from "fs";
import { join as pathJoin } from "path";
import assert = require("assert");
import { EOL } from "os";
import { execCmd } from "@lsos/utils";
import {
  decodeActivationKey,
  signatureIsValid,
  isExpired,
  ActivationKey,
} from "@lsos/utils/dist/activationKey";

export { activate };

type ProjectLsosConfig = {
  activationKeys: ActivationKey[];
};

async function activate(keyHash: string): Promise<void> {
  const activationKey: ActivationKey = decodeActivationKey(keyHash);

  if (!signatureIsValid(activationKey)) {
    assert(false, "Invalid key: the signature seems to have been corrupted.");
  }

  if (isExpired(activationKey)) {
    assert(false, "The activationKey you provided is expired.");
  }

  const alreadyAdded = await addActivationKey(activationKey);

  console.log(
    (alreadyAdded ? symbolInfo : symbolSuccess) +
      "Activation key " +
      (alreadyAdded ? "already included in" : "added to") +
      " " +
      stylePath(await getLsosConfigPath()) +
      "."
  );

  /*
  const isAlreadyRemoved: boolean = UserConfig.get()?.donationReminder?.remove;

  if (!isAlreadyRemoved) {
    UserConfig.set({
      donationReminder: {
        remove: true,
      },
    });
  }

  console.log(
    (isAlreadyRemoved ? symbolInfo : symbolSuccess) +
      "Lsos config " +
      (isAlreadyRemoved ? "" : "saved ") +
      "at " +
      stylePath(UserConfig.configFilePath) +
      ":"
  );
  console.log(prettyUserConfig());

  console.log();
  if (isAlreadyRemoved) {
    console.log(symbolInfo + "Donation-reminder already removed.");
  } else {
    console.log(symbolSuccess + "Donation-reminder successfully removed.");
  }
  console.log();

  console.log(
    symbolInfo + "More info at https://github.com/Lsos/donation-reminder."
  );
  console.log();
  */
}

/*
function prettyUserConfig() {
  const userConfig = UserConfig.get();
  const lines = splitByLine(JSON.stringify(userConfig, null, 2));
  const TAB = "    ";
  const withTabs = lines.map((line) => TAB + line).join(EOL);
  return withTabs;
}
*/

async function addActivationKey(
  activationKey: ActivationKey
): Promise<boolean> {
  const projectLsosConfig: ProjectLsosConfig = await readProjectLsosConfigFile();

  let activationKeys = projectLsosConfig.activationKeys || [];
  activationKeys = cleanExpiredActivationKeys(activationKeys);

  if (alreadyAdded(activationKeys, activationKey)) {
    return true;
  }

  activationKeys.push(activationKey);

  projectLsosConfig.activationKeys = activationKeys;

  await writeProjectLsosConfigFile(projectLsosConfig);

  return false;
}

function alreadyAdded(
  activationKeys: ActivationKey[],
  activationKey: ActivationKey
): boolean {
  return (
    activationKeys.findIndex(
      (key) => key.signature === activationKey.signature
    ) !== -1
  );
}

function cleanExpiredActivationKeys(
  activationKeys: ActivationKey[]
): ActivationKey[] {
  return activationKeys.filter((k) => !isExpired(k));
}

async function readProjectLsosConfigFile(): Promise<ProjectLsosConfig> {
  const projectLsosConfig: ProjectLsosConfig =
    readJsonFile(await getLsosConfigPath()) || {};
  assert(
    projectLsosConfig.constructor === Object,
    "The file at " +
      configPath +
      " should not exist or should be a JSON object."
  );
  return projectLsosConfig;
}
async function writeProjectLsosConfigFile(
  projectLsosConfig: ProjectLsosConfig
) {
  assert(projectLsosConfig.constructor === Object);
  writeJsonFile(await getLsosConfigPath(), projectLsosConfig);
}

var configPath: string;
async function getLsosConfigPath(): Promise<string> {
  if (!configPath) {
    const configFileName = "./.lsos.json";
    const gitRootDir = await getGitRootDir();
    configPath = pathJoin(gitRootDir, configFileName);
  }
  return configPath;
}
async function getGitRootDir() {
  const result = await execCmd("git rev-parse --show-toplevel");
  const gitRootDir = result.split("\n")[0];
  return gitRootDir;
}

function writeJsonFile(path: string, obj: any): void {
  assert(obj);
  const content = JSON.stringify(obj, null, 2);
  writeFileSync(path, content + EOL, "utf8");
}

function readJsonFile(path: string): any {
  try {
    const content = readFileSync(path, "utf8");
    const obj = JSON.parse(content);
    return obj;
  } catch (err) {
    return null;
  }
}
