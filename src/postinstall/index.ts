import { Env } from "../env/getEnv";
import { setEnv } from "../env/setEnv";
import { getExpirationDates } from "./getExpirationDates";
import { getNumberOfAuthors } from "./getNumberOfAuthors";
import { getRepoIsPublic } from "./getRepoIsPublic";

postinstall();

async function postinstall() {
  try {
    await env();
  } catch (err) {
    console.log("====== Warning ======");
    console.log(err);
  }
}

async function env() {
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
/*
async function env() {
  let expirationDates;
  let cwd;
  let isPublic;
  let numberOfAuthors;
  let orgName;
  let repoName;
  let repoUrl;
  await Promise.all([
    (async () => {
      expirationDates =
      await getExpirationDates();
    })(),
    (async () => {
      numberOfAuthors = await getNumberOfAuthors();
    })(),
    (async () => {
      const repoInfo = await getRepoIsPublic();
      isPublic = repoInfo.isPublic;
      repoUrl = repoInfo.repoUrl;
      orgName = repoInfo.orgName;
      repoName = repoInfo.repoName;
      cwd = repoInfo.cwd;
    })(),
  ]);

  const env: Env = {
    cwd,
    repo: {
      isPublic,
      numberOfAuthors,
      repoUrl,
      repoName,
      orgName,
    },
    activation: { expirationDates },
  };

  setEnv(env);
}
*/
