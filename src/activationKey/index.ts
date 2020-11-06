import assert = require("assert");
import { readFileSync } from "fs";
import { isAbsolute as pathIsAbsolute } from "path";
import { createVerify, createSign } from "crypto";
const publicKeyPath = require.resolve("../../src/activationKey/public.pem");

export { decodeActivationKey };
export { encodeActivationKey };
export { signatureVerify };
export { signatureCreate };

export type UserType = "company" | "individual" | "nonprofit";
export type UserInfo = {
  type: UserType;
  name: string;
  email: string;
  website: string;
};

export type ActivationData = {
  tool: string;
  user: UserInfo;
  purchasedDays: number;
  keyWasFree?: boolean;
};
type IssueDate = string & { _brand?: "IssueDate" };
type Signature = string & { _brand?: "Signature" };
export type ActivationKey = ActivationData & {
  issueDate: IssueDate;
  signature: Signature;
};

function decodeActivationKey(keyEncoded: string): ActivationKey {
  const keyString = base64_decode(keyEncoded);
  const activationKey = deserialize(keyString);
  return activationKey;
}
function encodeActivationKey(activationKey: ActivationKey): string {
  const { issueDate, signature } = activationKey;
  const keyString = serialize(activationKey, issueDate, signature);
  const keyEncoded = base64_encode(keyString);
  return keyEncoded;
}

function signatureCreate(
  activationData: ActivationData,
  issueDate: IssueDate,
  privateKeyPath: string
): string {
  const keyHash = serialize(activationData, issueDate);
  const signature = signCreate(keyHash, privateKeyPath);
  return signature;
}
function signatureVerify(activationKey: ActivationKey): boolean {
  const { issueDate, signature } = activationKey;
  const keyHash = serialize(activationKey, issueDate);
  const isValid: boolean = signVerify(keyHash, signature, publicKeyPath);
  return isValid;
}

function serialize(
  activationData: ActivationData,
  issueDate: IssueDate,
  signature?: Signature
): string {
  assertActivationKey(activationData);

  const keyValues = [
    activationData.tool, // 0
    activationData.user.type, // 1
    activationData.user.name, // 2
    activationData.user.email, // 3
    activationData.user.website, // 4
    activationData.purchasedDays.toString(), // 5
    (activationData.keyWasFree || false).toString(), // 6
    issueDate, // 7
  ];
  if (signature) keyValues.push(signature);
  assertKeyValues(keyValues);
  const keyString = keyValues.join("|");
  return keyString;
}
function deserialize(keyString: string): ActivationKey {
  const keyValues = keyString.split("|");
  assertKeyValues(keyValues);
  assert(keyValues.length === 7, JSON.stringify(keyValues));

  const activationKey: ActivationKey = {
    tool: keyValues[0],
    user: {
      type: keyValues[1] as UserType,
      name: keyValues[2],
      email: keyValues[3],
      website: keyValues[4],
    },
    purchasedDays: parseInt(keyValues[5], 10),
    keyWasFree: parseBoolean(keyValues[6]),
    issueDate: keyValues[7],
    signature: keyValues[8],
  };

  assertActivationKey(activationKey);
  assert(activationKey.signature);

  return activationKey;
}
function assertKeyValues(keyValues: any[]): void {
  keyValues.forEach((keyVal, i) => {
    assert(
      [String, Number, Boolean].includes(keyVal.constructor) &&
        (keyValues || keyVal === false),
      JSON.stringify({ keyVal, i })
    );
    assert(
      !keyVal.includes("|"),
      "The input `" + keyVal + "` should not contain the character `|`"
    );
  });
}

function assertActivationKey(activationKey: ActivationData) {
  assert(activationKey.tool);
  assert(activationKey.user.type);
  assert(activationKey.user.name);
  assert(activationKey.user.email);
  assert(activationKey.user.website);
  assert(activationKey.purchasedDays);
}

function base64_decode(str: string): string {
  return Buffer.from(str, "base64").toString("utf8");
}
function base64_encode(str: string): string {
  return Buffer.from(str).toString("base64");
}

function parseBoolean(str: string): boolean {
  assert(["true", "false"].includes(str));
  return str === "true";
}

function signVerify(
  keyHash: string,
  signature: Signature,
  publicKeyPath: string
): boolean {
  assert(keyHash);
  assert(signature);
  assert(pathIsAbsolute(publicKeyPath));
  const publicKey = readFileSync(publicKeyPath, "utf8");
  const verify = createVerify("SHA256");
  verify.update(keyHash);
  verify.end();
  const isValid = verify.verify(publicKey, signature, "hex");
  return isValid;
}
function signCreate(keyHash: string, privateKeyPath: string): string {
  assert(keyHash);
  assert(pathIsAbsolute(privateKeyPath));
  const privateKey = readFileSync(privateKeyPath, "utf8");
  const sign = createSign("SHA256");
  sign.update(keyHash);
  sign.end();
  const signature = sign.sign(privateKey, "hex");
  return signature;
}
