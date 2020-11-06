import {
  ActivationData,
  ActivationKey,
  signatureCreate,
  signatureVerify,
  encodeActivationKey,
  ActivationKeyData,
} from "./";
import assert = require("assert");
import { stringifyDate } from "../utils/stringifyDate";

export { generateActivationCommand };

function generateActivationCommand(
  activationData: ActivationData,
  privateKeyPath: string
): string {
  assert(privateKeyPath);

  const activationKeyData: ActivationKeyData = {
    ...activationData,
    issueDate: stringifyDate(new Date()),
  };

  const signature = signatureCreate(activationKeyData, privateKeyPath);

  const activationKey: ActivationKey = { ...activationKeyData, signature };

  assert(signatureVerify(activationKey));

  const keyEncoded = encodeActivationKey(activationKey);

  const activationCommand = "yarn lsos activate " + keyEncoded;

  return activationCommand;
}
