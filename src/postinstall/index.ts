import { saveExpirationDates } from "./saveExpirationDates";
import { saveNumberOfAuthors } from "./saveNumberOfAuthors/index";

postinstall();

async function postinstall() {
  try {
    await Promise.all([
      saveExpirationDates(require.resolve("../env/expirationDates.js")),
      saveNumberOfAuthors(require.resolve("../env/numberOfAuthors.js")),
    ]);
  } catch (err) {
    console.log("====== Warning ======");
    console.log(err);
  }
}
