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

export { activate };

type ActivationKey = {
  company: string;
  tool: string;
  activationPeriod: {
    begin: string;
    end: string;
  };
  signature: string;
};

type ProjectLsosConfig = {
  activationKeys: ActivationKey[];
};

async function activate(key: string): Promise<void> {
  const { company, tool, activationPeriod, signature } = decodeKey(key);

  const activationKey = { company, tool, activationPeriod, signature };

  checkSignature(activationKey);

  console.log(company, tool, signature, activationPeriod);

  await addActivationKey(activationKey);

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

function checkSignature(activationKey: ActivationKey): void {
  const signatureContent = dehash(activationKey.signature);
  const checkFailed = signatureContent === serialize_key(activationKey);
  if (checkFailed) {
    console.log(activationKey);
    assert(false, "Invalid key: the signature seems to have been corrupted.");
  }
}
function serialize_key(activationKey: ActivationKey) {
  return [
    activationKey.tool,
    activationKey.company,
    activationKey.activationPeriod.begin,
    activationKey.activationPeriod.end,
  ].join("|");
}

function dehash(str: string): string {
  return str;
}

function decodeKey(key: string): ActivationKey {
  return {
    company: "MegaCorp",
    tool: "SuperLib",
    activationPeriod: {
      begin: "2020-09-06",
      end: "2020-09-13",
    },
    signature: "euhwqieuh",
  };
}

async function getGitRootDir() {
  const gitRootDir = await execCmd("git rev-parse --show-toplevel");
  return gitRootDir;
}

async function addActivationKey(activationKey: ActivationKey) {
  const gitRootDir = await getGitRootDir();

  const configFileName = "./.lsos.json";
  const configPath = pathJoin(gitRootDir, configFileName);

  const projectLsosConfig: ProjectLsosConfig = readJsonFile(configPath);

  let activationKeys = projectLsosConfig.activationKeys || [];
  activationKeys = cleanExpiredActivationKeys(activationKeys);

  if (
    activationKeys.findIndex(
      (key) => key.signature === activationKey.signature
    ) === -1
  ) {
    activationKeys.push(activationKey);
  }

  projectLsosConfig.activationKeys = activationKeys;

  assert(
    projectLsosConfig.constructor === Array,
    "The JSON file at " + configPath + " should be an array."
  );

  writeJsonFile(configPath, projectLsosConfig);
}

function cleanExpiredActivationKeys(
  activationKeys: ActivationKey[]
): ActivationKey[] {
  return activationKeys.filter((activationKey) => {
    if (new Date(activationKey.activationPeriod.end) < new Date()) {
      return false;
    }
    return true;
  });
}

function writeJsonFile(path: string, obj: any): void {
  const content = JSON.stringify(obj, null, 2);
  writeFileSync(path, content + EOL, "utf8");
}

function readJsonFile(path: string): any {
  try {
    const content = readFileSync(path, "utf8");
    const obj = JSON.parse(content);
    return obj;
  } catch (err) {
    // return {};
    return [];
  }
}
