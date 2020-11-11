import { writeFileSync, readFileSync } from "fs";
import { findLastIndex } from "../utils/findLastIndex";
import { splitByLine } from "../utils/split";
import { isAbsolute as pathIsAbsolute } from "path";
import assert = require("assert");
import { EOL } from "os";
import { Env } from "./getEnv";

const envDataFile = require.resolve("./envData");

export { setEnv };

function setEnv(envValue: Env): void {
  replaceFileContent(envDataFile, "envData", envValue);
  removeRequireCache(envDataFile);
}

function replaceFileContent(
  filePath: string,
  variableName: string,
  variableValue: any
) {
  const {
    boilerplateLinesBefore,
    boilerplateLinesAfter,
  } = getBoilerplateLines();
  writeFileSync(
    filePath,
    [
      ...boilerplateLinesBefore,
      getNewContentLine(),
      ...boilerplateLinesAfter,
    ].join(EOL),
    "utf8"
  );

  return;

  function getNewContentLine() {
    assert(!variableValue || !variableValue.then);
    const variableValue__string = JSON.stringify(variableValue);
    assert(JSON.stringify(true) === "true");
    assert(JSON.stringify(3) === "3");
    assert(JSON.stringify([{ answer: 42 }]) === '[{"answer":42}]');
    assert(splitByLine(variableValue__string).length === 1);
    return getContentLineBegin() + variableValue__string + ";";
  }
  function getContentLineBegin() {
    return "exports." + variableName + " = ";
  }

  function getBoilerplateLines() {
    assert(pathIsAbsolute(filePath));
    const fileContent = readFileSync(filePath, "utf8");
    const fileLines = splitByLine(fileContent);
    const contentLineBegin = getContentLineBegin();
    const contentLineIndex = findLastIndex(fileLines, (line) =>
      line.startsWith(contentLineBegin)
    );
    assert(contentLineIndex > -1);
    const boilerplateLinesBefore = fileLines.slice(0, contentLineIndex);
    const boilerplateLinesAfter = fileLines.slice(
      contentLineIndex + 1,
      fileLines.length
    );
    assert(
      fileLines.length ===
        boilerplateLinesBefore.length + boilerplateLinesAfter.length + 1
    );
    return { boilerplateLinesBefore, boilerplateLinesAfter };
  }
}

function removeRequireCache(modulePath: string): void {
  // Ensure that require(modulePath) reloads
  delete require.cache[modulePath];
}
