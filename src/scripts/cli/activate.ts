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

async function activate(keyHash: string): Promise<void> {
  const activationKey = decodeKeyHash(keyHash);
  checkSignature(activationKey);

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
  const signatureContent = decryptSignature(activationKey.signature);
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
function deserialize_key(keyString: string): ActivationKey {
  // TODO serialze | in values or forbid |
  const keyValues = keyString.split("|");

  const activationKey = {
    tool: keyValues[0],
    company: keyValues[1],
    activationPeriod: {
      begin: keyValues[2],
      end: keyValues[3],
    },
    signature: keyValues[4],
  };

  checkActivationKey(activationKey);

  return activationKey;
}
function checkActivationKey(activationKey: ActivationKey) {
  if (isExpired(activationKey)) {
    console.log(activationKey);
    assert(false, "The activationKey you provided is expired.");
  }
  assert(activationKey.tool);
  assert(activationKey.company);
  assert(activationKey.signature);
  assert(activationKey.activationPeriod.begin);
  assert(activationKey.activationPeriod.end);
}

async function addActivationKey(activationKey: ActivationKey) {
  const projectLsosConfig: ProjectLsosConfig = await readProjectLsosConfigFile();

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

  await writeProjectLsosConfigFile(projectLsosConfig);
}

function cleanExpiredActivationKeys(
  activationKeys: ActivationKey[]
): ActivationKey[] {
  return activationKeys.filter((k) => !isExpired(k));
}
function isExpired(activationKey: ActivationKey) {
  if (new Date(activationKey.activationPeriod.end) < new Date()) {
    return true;
  }
  return false;
}

async function readProjectLsosConfigFile(): Promise<ProjectLsosConfig> {
  const projectLsosConfig: ProjectLsosConfig =
    readJsonFile(await getConfigPath()) || {};
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
  writeJsonFile(await getConfigPath(), projectLsosConfig);
}

var configPath: string;
async function getConfigPath(): Promise<string> {
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
  console.log(content);
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

function decodeKeyHash(keyHash: string): ActivationKey {
  const keyString = base64_decode(keyHash);

  const activationKey = deserialize_key(keyString);

  return activationKey;
}

function base64_decode(str: string): string {
  return atob(str);
}
function base64_encode(str: string): string {
  return btoa(str);
}

var crypto = require("crypto");
var path = require("path");
var fs = require("fs");
const passphrase = "mySecret";

var encryptStringWithRsaPublicKey = function (
  toEncrypt,
  relativeOrAbsolutePathToPublicKey
) {
  var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
  var publicKey = fs.readFileSync(absolutePath, "utf8");
  var buffer = new Buffer(toEncrypt);
  var encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
};

var decryptStringWithRsaPrivateKey = function (
  toDecrypt,
  relativeOrAbsolutePathtoPrivateKey
) {
  var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
  var privateKey = fs.readFileSync(absolutePath, "utf8");
  var buffer = new Buffer(toDecrypt, "base64");
  //var decrypted = crypto.privateDecrypt(privateKey, buffer);
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: passphrase,
    },
    buffer
  );
  return decrypted.toString("utf8");
};

let a = encryptStringWithRsaPublicKey("hello", "public.pem");
let b = decryptStringWithRsaPrivateKey(a, "private.pem");
console.log(b);

function decryptSignature(str: string): string {
  var buffer = new Buffer(toDecrypt, "base64");
  return str;
}
function encryptSignature() {
  var buffer = new Buffer(toDecrypt, "base64");
  return str;
}
