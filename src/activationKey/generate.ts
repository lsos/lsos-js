import {
  ActivationKeyData,
  ActivationKey,
  signatureCreate,
  signatureVerify,
  encodeActivationKey,
} from "./";
import assert = require("assert");

export { generate };

function generate(
  activationKeyData: ActivationKeyData,
  privateKeyPath: string
): string {
  assert(privateKeyPath);

  const signature = signatureCreate(activationKeyData, privateKeyPath);

  const activationKey: ActivationKey = { ...activationKeyData, signature };

  assert(signatureVerify(activationKey));

  const keyEncoded = encodeActivationKey(activationKey);

  const activationCommand = "yarn lsos activate " + keyEncoded;

  return activationCommand;
}
