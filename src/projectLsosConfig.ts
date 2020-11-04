import assert = require("assert");
import { EOL } from "os";
import { isAbsolute as pathIsAbsolute } from "path";
import { writeFileSync, readFileSync } from "fs";
import { ActivationKey } from "./activationKey";
import findUp = require("find-up");

export { getActivationKeys };
export { readProjectLsosConfigFile };
export { writeProjectLsosConfigFile };
export { getProjectLsosConfigPath };

export type ProjectLsosConfig = {
  activationKeys: ActivationKey[];
};

async function getActivationKeys(): Promise<ActivationKey[]> {
  const projectLsosConfig: ProjectLsosConfig = await readProjectLsosConfigFile();
  const activationKeys = projectLsosConfig.activationKeys || [];
  return activationKeys;
}

async function readProjectLsosConfigFile(): Promise<ProjectLsosConfig> {
  const projectLsosConfig: ProjectLsosConfig =
    readJsonFile(await getProjectLsosConfigPath()) || {};
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
  writeJsonFile(await getProjectLsosConfigPath(), projectLsosConfig);
}

var configPath: string;
async function getProjectLsosConfigPath(): Promise<string> {
  if (!configPath) {
    const found = await findConfigFile();
    if (found) {
      configPath = found;
    }
  }
  return configPath;
}
async function findConfigFile() {
  const lsosConfigPath = await findUp(".lsos.json");
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