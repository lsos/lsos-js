import { saveExpirationDates } from "./postinstall/saveExpirationDates";
import { saveNumberOfAuthors } from "@lsos/utils/dist/saveNumberOfAuthors/index";

postinstall();

async function postinstall() {
  try {
    await Promise.all([saveExpirationDates(), saveNumberOfAuthors()]);
  } catch (err) {
    console.log("====== Warning ======");
    console.log(err);
  }
}
