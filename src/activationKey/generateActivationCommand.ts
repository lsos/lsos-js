import {
  ActivationData,
  ActivationKey,
  signatureCreate,
  isInvalidKey,
  encodeActivationKey,
} from "./";
import assert = require("assert");
import { stringifyDate } from "../utils/stringifyDate";

export { generateActivationCommand };

function generateActivationCommand(
  activationData: ActivationData,
  privateKeyPath: string
): { npmCommand: string; yarnCommand: string } {
  assert(privateKeyPath);

  const issueDate = stringifyDate(new Date());

  const signature = signatureCreate(activationData, issueDate, privateKeyPath);

  const activationKey: ActivationKey = {
    ...activationData,
    issueDate,
    signature,
  };

  assert(!isInvalidKey(activationKey));

  const keyEncoded = encodeActivationKey(activationKey);

  const activationCommand = "lsos activate " + keyEncoded;
  const npmCommand = "npx " + activationCommand;
  const yarnCommand = "yarn " + activationCommand;

  return { npmCommand, yarnCommand };
}
