const ANSI_CODES = getAnsiCodes();

export { stylePath };
export { styleError };
export { styleErrorEmphasis };

export { fgGreen };
export { fgGray };
export { fgBlue };
export { fgRed };

export { fgBold };

function stylePath(str: string): string {
  return fgDim(str);
}
function styleError(str: string): string {
  return fgRedBright(str);
}
function styleErrorEmphasis(str: string): string {
  return fgRed(fgBold(str));
}

function fgGreen(str: string): string {
  return ANSI_CODES.GREEN + str + ANSI_CODES._RESET;
}
function fgBlue(str: string): string {
  return ANSI_CODES.BLUE + str + ANSI_CODES._RESET;
}
function fgRed(str: string): string {
  return ANSI_CODES.RED + str + ANSI_CODES._RESET;
}
function fgRedBright(str: string): string {
  return ANSI_CODES.RED_BRIGHT + str + ANSI_CODES._RESET;
}
function fgGray(str: string): string {
  return ANSI_CODES.DIM + str + ANSI_CODES._RESET;
}

function fgBold(str: string): string {
  return ANSI_CODES.BOLD + str + ANSI_CODES._RESET;
}
function fgDim(str: string): string {
  return ANSI_CODES.DIM + str + ANSI_CODES._RESET;
}

function getAnsiCodes() {
  // Reference:
  //  - https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color/50325607#50325607
  return {
    GREEN: "\x1b[32m",
    BLUE: "\x1b[34m",
    RED: "\x1b[31m",
    RED_BRIGHT: "\x1b[91m",

    BOLD: "\x1b[1m",
    DIM: "\x1b[2m",

    _RESET: "\x1b[0m",
  };
}
