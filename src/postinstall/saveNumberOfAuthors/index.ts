import { replaceFileContent } from "../../utils/replaceFileContent";
import { retrieveNumberOfAuthors } from "./retrieveNumberOfAuthors";
import assert = require("assert");

export { saveNumberOfAuthors };

async function saveNumberOfAuthors(envFile: string) {
  const numberOfAuthors = await retrieveNumberOfAuthors();
  assert(numberOfAuthors === null || numberOfAuthors >= 0);

  replaceFileContent(envFile, "numberOfAuthors", numberOfAuthors);
}
