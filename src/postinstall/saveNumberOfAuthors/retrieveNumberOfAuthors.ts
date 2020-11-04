import { execCmd } from "../../utils/execCmd";
import { splitByLine, splitByWhitespace } from "../../utils/split";
import assert = require("assert");

export { retrieveNumberOfAuthors };

const MIN_NUMBER_OF_COMMITS = 5;
const LOOKUP_PERIOD = getDateAgo({ month: 3 });

async function retrieveNumberOfAuthors(): Promise<number | null> {
  const gitAuthorList = await getGitAuthorList();
  if (!gitAuthorList) {
    return null;
  }

  const authors = splitByLine(gitAuthorList)
    .filter(Boolean)
    .map((authorSummary) => {
      const parts = splitByWhitespace(authorSummary).filter(Boolean);

      const partNumberOfCommits = parts[0];
      const numberOfCommits = parseInt(partNumberOfCommits, 10);
      assert(numberOfCommits >= 1);
      assert(numberOfCommits.toString() === partNumberOfCommits);

      const partEmail = parts[parts.length - 1];
      assert(partEmail.startsWith("<"));
      assert(partEmail.endsWith(">"));
      const email = partEmail.slice(1, partEmail.length - 1);
      assert(email.length === partEmail.length - 2);

      const partName = parts.slice(1, parts.length - 1);
      assert(partName.length === parts.length - 2);
      const name = partName.join(" ");

      return { name, email, numberOfCommits };
    });

  let numberOfAuthors = 0;
  const authorNames: { [key: string]: boolean } = {};
  const authorEmails: { [key: string]: boolean } = {};
  authors.forEach(({ numberOfCommits, name, email }) => {
    // We consider someone an author only if he commited at least `MIN_NUMBER_OF_COMMITS`
    if (numberOfCommits < MIN_NUMBER_OF_COMMITS) {
      return;
    }

    email = email.toLowerCase();
    name = name.toLowerCase();

    // Detect duplicated user
    if (authorEmails[email] === true) {
      return;
    }

    // Detect duplicated user
    // We don't match first names, such as "Alice"
    const isFirstNameOnly = name.split(" ").length === 1;
    if (authorNames[name] === true && !isFirstNameOnly) {
      return;
    }

    // Detect bots
    const botRegex = /\bbot\b/;
    if (botRegex.test(name) || botRegex.test(email)) {
      return;
    }

    authorEmails[email] = true;
    authorEmails[name] = true;
    numberOfAuthors++;
  });

  return numberOfAuthors;
}

async function getGitAuthorList(): Promise<string | null> {
  try {
    // To get authors with commit dates:
    //   git log --pretty=format:"%an %ae %ad" --date=short
    const cmd = `git shortlog --summary --numbered --email --all --after ${LOOKUP_PERIOD}`;
    return await execCmd(cmd);
  } catch (_) {
    return null;
  }
}

function getDateAgo({ month }: { month: number }): string {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const TIME_AGO = ONE_DAY * 31 * month;
  const today__epoch = new Date().getTime();
  const dateAgo__epoch = today__epoch - TIME_AGO;
  const dateAgo__date = new Date(dateAgo__epoch);
  const dateAgo = [
    dateAgo__date.getFullYear(),
    dateAgo__date.getMonth() + 1,
    dateAgo__date.getDate(),
  ].join("-");
  return dateAgo;
}
