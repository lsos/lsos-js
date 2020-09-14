import { findExpirationDates } from "./postinstall/findExpirationDates";
import { findNumberOfAuthors } from "@lsos/utils/dist/findNumberOfAuthors/index";

postinstall();

async function postinstall() {
  try {
    await Promise.all([findExpirationDates(), findNumberOfAuthors()]);
  } catch (err) {
    console.log("====== Warning ======");
    console.log(err);
  }
}
