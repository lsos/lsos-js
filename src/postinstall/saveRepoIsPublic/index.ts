import { replaceFileContent } from "../../utils/replaceFileContent";
import { checkIfRepoIsPublic } from "./checkIfRepoIsPublic";
import assert = require("assert");

export { saveRepoIsPublic };

async function saveRepoIsPublic(envFile: string) {
  const repoIsPublic: boolean | null = await checkIfRepoIsPublic();
  assert(repoIsPublic === null || [true, false].includes(repoIsPublic));

  replaceFileContent(envFile, "repoIsPublic", repoIsPublic);
}
