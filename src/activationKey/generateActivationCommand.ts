import {
  ActivationKeyDataWithoutIssueDate,
  ActivationKey,
  signatureCreate,
  signatureVerify,
  encodeActivationKey,
  ActivationKeyData,
} from "./";
import assert = require("assert");

export { generateActivationCommand };

function generateActivationCommand(
  activationData: ActivationKeyDataWithoutIssueDate,
  privateKeyPath: string
): string {
  assert(privateKeyPath);

  const activationKeyData: ActivationKeyData = {
    ...activationData,
    issueDate: serializeDate(new Date()),
  };

  const signature = signatureCreate(activationKeyData, privateKeyPath);

  const activationKey: ActivationKey = { ...activationKeyData, signature };

  assert(signatureVerify(activationKey));

  const keyEncoded = encodeActivationKey(activationKey);

  const activationCommand = "yarn lsos activate " + keyEncoded;

  return activationCommand;
}

function serializeDate(date: Date): string {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
}
