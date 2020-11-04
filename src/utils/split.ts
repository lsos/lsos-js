export { splitByLine, splitByWhitespace };

function splitByLine(str: string): string[] {
  // https://stackoverflow.com/questions/21895233/how-in-node-to-split-string-by-newline-n
  return str.split(/\r?\n/);
}

function splitByWhitespace(str: string): string[] {
  return str.split(/\s/).filter(Boolean);
}
