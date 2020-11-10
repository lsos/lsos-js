import assert = require("assert");
import { EOL } from "os";
import { isAbsolute as pathIsAbsolute, join as pathJoin } from "path";
import { writeFileSync, readFileSync } from "fs";
import { ActivationKey, isInvalidKey } from "./activationKey";
import findUp = require("find-up");
const CONFIG_FILENAME = ".lsos.json";

export { getActivationKeys };
export { readProjectLsosConfigFile };
export { writeProjectLsosConfigFile };
export { getProjectLsosConfigPath };

export type ProjectLsosConfig = {
  activationKeys: ActivationKey[];
};

async function getActivationKeys(): Promise<ActivationKey[]> {
  const projectLsosConfig: ProjectLsosConfig = await readProjectLsosConfigFile();
  let activationKeys: ActivationKey[] = projectLsosConfig.activationKeys || [];
  activationKeys = activationKeys.filter((key) => !isInvalidKey(key));
  return activationKeys;
}

async function readProjectLsosConfigFile(): Promise<ProjectLsosConfig> {
  const projectLsosConfig: ProjectLsosConfig =
    readJsonFile(await getProjectLsosConfigPath()) || {};
  assert(
    projectLsosConfig.constructor === Object,
    "The file at " + configPath + " should should be a JSON object."
  );
  return projectLsosConfig;
}
async function writeProjectLsosConfigFile(
  projectLsosConfig: ProjectLsosConfig
) {
  assert(projectLsosConfig.constructor === Object);
  const configPath = await getProjectLsosConfigPath();
  writeJsonFile(configPath, projectLsosConfig);
}

var configPath: string;
async function getProjectLsosConfigPath(): Promise<string> {
  if (!configPath) {
    const found = await findConfigFile();
    if (found) {
      configPath = found;
    } else {
      configPath = pathJoin(process.cwd(), CONFIG_FILENAME);
    }
  }
  return configPath;
}
async function findConfigFile(): Promise<undefined | string> {
  const lsosConfigPath = await findUp(CONFIG_FILENAME);
  assert(lsosConfigPath === undefined || pathIsAbsolute(lsosConfigPath));
  return lsosConfigPath;
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
