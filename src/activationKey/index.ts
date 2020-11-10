import assert = require("assert");
import { readFileSync } from "fs";
import { isAbsolute as pathIsAbsolute } from "path";
import { createVerify, createSign } from "crypto";
const publicKeyPath = require.resolve("../../src/activationKey/public.pem");

export { decodeActivationKey };
export { encodeActivationKey };

export { isInvalidKey };

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
  keyWasFree: boolean;
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

function isInvalidKey(key: ActivationKey) {
  if (!isValidActivationKey(key)) {
    return { wrongData: true };
  }
  if (!signatureVerify(key)) {
    return { wrongSignature: true };
  }
  return false;
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
  assert(isValidActivationData);

  const keyValues = [
    activationData.tool, // prop-0
    activationData.user.type, // prop-1
    activationData.user.name, // prop-2
    activationData.user.email, // prop-3
    activationData.user.website, // prop-4
    activationData.purchasedDays.toString(), // prop-5
    activationData.keyWasFree.toString(), // prop-6
    issueDate, // prop-7
  ];
  if (signature) keyValues.push(signature);
  assertKeyValues(keyValues);
  const keyString = keyValues.join("|");
  return keyString;
}
function deserialize(keyString: string): ActivationKey {
  const keyValues = keyString.split("|");
  assertKeyValues(keyValues);
  assert(keyValues.length === 9, JSON.stringify(keyValues));

  const activationKey: ActivationKey = {
    tool: keyValues[0], // prop-0
    user: {
      type: keyValues[1] as UserType, // prop-1
      name: keyValues[2], // prop-2
      email: keyValues[3], // prop-3
      website: keyValues[4], // prop-4
    },
    purchasedDays: parseInt(keyValues[5], 10), // prop-5
    keyWasFree: parseBoolean(keyValues[6]), // prop-6
    issueDate: keyValues[7], // prop-7
    signature: keyValues[8], // prop-8
  };

  assert(isValidActivationKey(activationKey));

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

function isValidActivationData(activationData: unknown) {
  return (
    // activationData
    typeof activationData === "object" &&
    activationData !== null &&
    // activationData.tool (prop-0)
    has(activationData, "tool") &&
    typeof activationData.tool === "string" &&
    // activationData.user
    has(activationData, "user") &&
    typeof activationData.user === "object" &&
    activationData.user !== null &&
    // activationData.user.type (prop-1)
    isString(activationData.user, "type") &&
    // activationData.user.name (prop-2)
    isString(activationData.user, "name") &&
    // activationData.user.email (prop-3)
    isString(activationData.user, "email") &&
    // activationData.user.website (prop-4)
    isString(activationData.user, "website") &&
    // activationData.purchasedDays (prop-5)
    isNumber(activationData, "purchasedDays") &&
    // activationData.keyWasFree (prop-6)
    isBoolean(activationData, "keyWasFree")
  );
}
function isValidActivationKey(activationKey: unknown) {
  return (
    isValidActivationData(activationKey) &&
    // activationData
    typeof activationKey === "object" &&
    activationKey !== null &&
    // activationData.issueDate (prop-7)
    has(activationKey, "issueDate") &&
    isValidIssueDate(activationKey.issueDate) &&
    // activationData.signature (prop-8)
    isString(activationKey, "signature")
  );
}
function isValidIssueDate(issueDate: unknown) {
  return (
    issueDate &&
    typeof issueDate === "string" &&
    new Date(issueDate) &&
    new Date(issueDate).getTime() < new Date().getTime()
  );
}
function isNumber(obj: object, prop: string) {
  return has(obj, prop) && typeof obj[prop] === "number";
}
function isBoolean(obj: object, prop: string) {
  return has(obj, prop) && typeof obj[prop] === "boolean";
}
function isString(obj: object, prop: string) {
  return has(obj, prop) && typeof obj[prop] === "string";
}
function has<P extends PropertyKey>(
  target: object,
  property: P
): target is { [K in P]: unknown } {
  // Source: https://github.com/Microsoft/TypeScript/issues/21732#issuecomment-663994772
  return property in target;
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
