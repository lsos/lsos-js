import {
  symbolInfo,
  symbolSuccess,
  stylePath,
} from "@lsos/utils/dist/cli-components";
import assert = require("assert");

import {
  decodeActivationKey,
  signatureVerify,
  ActivationKey,
} from "@lsos/utils/dist/activationKey";
import {
  getProjectLsosConfigPath,
  ProjectLsosConfig,
  readProjectLsosConfigFile,
  writeProjectLsosConfigFile,
} from "../utils/projectLsosConfig";

export { activate };

async function activate(keyEncoded: string): Promise<void> {
  const activationKey: ActivationKey = decodeActivationKey(keyEncoded);

  if (!signatureVerify(activationKey)) {
    assert(false, "Invalid key: the signature seems to have been corrupted.");
  }

  const alreadyAdded = await addActivationKey(activationKey);

  console.log(
    (alreadyAdded ? symbolInfo : symbolSuccess) +
      "Activation key " +
      (alreadyAdded ? "already included in" : "added to") +
      " " +
      stylePath(await getProjectLsosConfigPath()) +
      "."
  );
}

async function addActivationKey(
  activationKey: ActivationKey
): Promise<boolean> {
  const projectLsosConfig: ProjectLsosConfig = await readProjectLsosConfigFile();

  const activationKeys = projectLsosConfig.activationKeys || [];

  if (alreadyAdded(activationKeys, activationKey)) {
    return true;
  }

  activationKeys.push(activationKey);

  projectLsosConfig.activationKeys = activationKeys;

  await writeProjectLsosConfigFile(projectLsosConfig);

  return false;
}

function alreadyAdded(
  activationKeys: ActivationKey[],
  activationKey: ActivationKey
): boolean {
  return (
    activationKeys.findIndex(
      (key) => key.signature === activationKey.signature
    ) !== -1
  );
}
