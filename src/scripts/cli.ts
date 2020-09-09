#!/usr/bin/env node

import { activate } from "./cli/activate";
import { header, fgBold, styleError, styleErrorEmphasis } from "@lsos/utils";
import assert = require("assert");
import { EOL } from "os";

cli();

function cli() {
  console.log(header);
  console.log();

  const cmd = getCommand();

  switch (cmd) {
    case "activate":
      activate();
      break;
    default:
      console.log(styleError("Unknown command ") + styleErrorEmphasis(cmd));
      console.log();
    case "help":
    case "":
      showHelp();
  }
}

function showHelp() {
  console.log(
    [
      "Usage: lsos " + /*cmdColor*/ "<command>",
      "",
      "Commands:",
      `  ${cmdColor("activate")}     Activate Lsos Basic projects`,
      `  ${cmdColor("help")}         Display this help information`,
      "",
    ].join(EOL)
  );
}

function cmdColor(str: string): string {
  return fgBold(str);
}

function getCommand(): string {
  const { argv } = process;
  if (argv.length !== 3) {
    return "";
  }
  const cmd = argv[2];
  assert(cmd.constructor === String);
  return cmd;
}
