import { saveExpirationDates } from "./postinstall/saveExpirationDates";
import { saveNumberOfAuthors } from "@lsos/utils/dist/saveNumberOfAuthors/index";

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
