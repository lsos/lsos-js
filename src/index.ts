export { isActivated };
export { numberOfGitAuthors };
export const callToActivate = getCallToActivate();

function isActivated(): boolean {
  return false;
}

function numberOfGitAuthors(): number {
  return 3;
}

function getCallToActivate(): string {
  return "Go to https://lsos.org/npm/wildcard-api/activate` to activate Wildcard API.";
  return "Run `$ lsos activate` to activate [name-of-lib].";
}
