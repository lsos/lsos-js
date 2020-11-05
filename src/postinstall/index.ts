import { saveExpirationDates } from "./saveExpirationDates";
import { saveNumberOfAuthors } from "./saveNumberOfAuthors";
import { saveRepoIsPublic } from "./saveRepoIsPublic";

postinstall();

async function postinstall() {
  try {
    await Promise.all([
      saveExpirationDates(require.resolve("../env/expirationDates.js")),
      saveRepoIsPublic(require.resolve("../env/repoIsPublic.js")),
      saveNumberOfAuthors(require.resolve("../env/numberOfAuthors.js")),
    ]);
  } catch (err) {
    console.log("====== Warning ======");
    console.log(err);
  }
}
