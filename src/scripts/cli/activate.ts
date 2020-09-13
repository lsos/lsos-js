import { symbolInfo, symbolSuccess, stylePath } from "@lsos/utils";
import { writeFileSync, readFileSync } from "fs";
import { join as pathJoin } from "path";
import assert = require("assert");
import { EOL } from "os";
import { execCmd } from "@lsos/utils";
import {
  decodeActivationKey,
  signatureVerify,
  ActivationKey,
} from "@lsos/utils/dist/activationKey";

export { activate };
export { getActivationKeys };

type ProjectLsosConfig = {
  activationKeys: ActivationKey[];
};

async function activate(keyEncoded: string): Promise<void> {
  const activationKey: ActivationKey = decodeActivationKey(keyEncoded);

  if (!signatureVerify(activationKey)) {
    assert(false, "Invalid key: the signature seems to have been corrupted.");
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
}

async function addActivationKey(
  activationKey: ActivationKey
): Promise<boolean> {
  const projectLsosConfig: ProjectLsosConfig = await readProjectLsosConfigFile();

  const activationKeys = projectLsosConfig.activationKeys || [];

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

async function getActivationKeys(): Promise<ActivationKey[]> {
  const projectLsosConfig: ProjectLsosConfig = await readProjectLsosConfigFile();
  const activationKeys = projectLsosConfig.activationKeys || [];
  return activationKeys;
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
