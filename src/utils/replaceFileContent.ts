import { writeFileSync, readFileSync } from "fs";
import { findLastIndex } from "./findLastIndex";
import { splitByLine } from "./split";
import { isAbsolute as pathIsAbsolute } from "path";
import assert = require("assert");
import { EOL } from "os";

export { replaceFileContent };

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
