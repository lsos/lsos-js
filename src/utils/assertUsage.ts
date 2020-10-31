export { assertUsage };

function assertUsage(bool: any, errorMsg: string) {
  if (bool) {
    return;
  }

  throw new Error("[lsos] " + errorMsg);
}
