import assert = require("assert");
import { readFileSync } from "fs";
import { isAbsolute as pathIsAbsolute } from "path";
import { createVerify, createSign } from "crypto";
const publicKeyPath = require.resolve("../../src/activationKey/public.pem");

export { decodeActivationKey };
export { encodeActivationKey };
export { signatureVerify };
export { signatureCreate };

export type ActivationKeyData = {
  tool: string;
  company: {
    name: string;
    website: string;
  };
  purchasedDays: number;
  issueDate: string;
  keyWasFree?: boolean;
};
export type ActivationKey = ActivationKeyData & {
  signature: string;
};

function decodeActivationKey(keyEncoded: string): ActivationKey {
  const keyString = base64_decode(keyEncoded);
  const activationKey = deserialize(keyString);
  return activationKey;
}
function encodeActivationKey(activationKey: ActivationKey): string {
  const keyString = serializeWithSignature(activationKey);
  const keyEncoded = base64_encode(keyString);
  return keyEncoded;
}

function signatureCreate(
  activationKeyData: ActivationKeyData,
  privateKeyPath: string
): string {
  const keyHash = computeKeyHash(activationKeyData);
  const signature = signCreate(keyHash, privateKeyPath);
  return signature;
}
function signatureVerify(activationKey: ActivationKey): boolean {
  const { signature } = activationKey;
  const keyHash = computeKeyHash(activationKey);
  const isValid: boolean = signVerify(keyHash, signature, publicKeyPath);
  return isValid;
}

function computeKeyHash(
  activationKey: ActivationKeyData | ActivationKey
): string {
  const keyHash = serializeWithoutSignature(activationKey);
  return keyHash;
}

function serializeWithoutSignature(
  activationKey: ActivationKeyData | ActivationKey
): string {
  return _serialize(activationKey, false);
}
function serializeWithSignature(activationKey: ActivationKey): string {
  return _serialize(activationKey, true);
}
function _serialize(
  activationKey: ActivationKey | ActivationKeyData,
  withSignature: boolean
): string {
  assertActivationKey(activationKey);

  const keyValues = [
    activationKey.tool,
    activationKey.company.name,
    activationKey.company.website,
    activationKey.purchasedDays.toString(),
    activationKey.issueDate,
    (activationKey.keyWasFree || false).toString(),
  ];
  if (withSignature) {
    assert((activationKey as ActivationKey).signature);
    keyValues.push((activationKey as ActivationKey).signature);
  }
  assertKeyValues(keyValues);
  const keyString = keyValues.join("|");
  return keyString;
}
function deserialize(keyString: string): ActivationKey {
  const keyValues = keyString.split("|");
  assertKeyValues(keyValues);
  assert(keyValues.length === 7, JSON.stringify(keyValues));

  const activationKey = {
    tool: keyValues[0],
    company: {
      name: keyValues[1],
      website: keyValues[2],
    },
    purchasedDays: parseInt(keyValues[3], 10),
    issueDate: keyValues[4],
    keyWasFree: parseBoolean(keyValues[5]),
    signature: keyValues[6],
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

function assertActivationKey(activationKey: ActivationKey | ActivationKeyData) {
  assert(activationKey.tool);
  assert(activationKey.company.name);
  assert(activationKey.company.website);
  assert(activationKey.purchasedDays);
  assert(activationKey.issueDate);
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
  signature: string,
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

