export { isActivated };
export { numberOfGitAuthors };
export const callToActivate = getCallToActivate();

function isActivated(): boolean {
  return true;
}

function numberOfGitAuthors(): number {
  return 3;
}

function getCallToActivate(): string {
  return "Run `$ lsos activate` to activate [name-of-lib].";
}
