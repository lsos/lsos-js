import { postinstall as postinstallFunction } from "../../postinstall";
import { debug } from "./debug";

export { postinstall };

async function postinstall() {
  await postinstallFunction();
  debug();
}
