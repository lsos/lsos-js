import { Env } from "../env/getEnv";
import { setEnv } from "../env/setEnv";
import { getExpirationDates } from "./getExpirationDates";
import { getNumberOfAuthors } from "./getNumberOfAuthors";
import { getRepoIsPublic } from "./getRepoIsPublic";

export { postinstall };

async function postinstall() {
  try {
    await determineEnv();
  } catch (err) {
    console.log("====== Warning ======");
    console.log(err);
  }
}

async function determineEnv() {
  const [expirationDates, numberOfAuthors, repoInfo] = await Promise.all([
    await getExpirationDates(),
    await getNumberOfAuthors(),
    await getRepoIsPublic(),
  ]);

  const env: Env = {
    cwd: repoInfo.cwd,
    repo: {
      isPublic: repoInfo.isPublic,
      numberOfAuthors,
      repoUrl: repoInfo.repoUrl,
      repoName: repoInfo.repoName,
      orgName: repoInfo.orgName,
    },
    activation: { expirationDates },
  };

  setEnv(env);
}
