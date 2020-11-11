import { getEnv } from "../../env/getEnv";

export { debug };

function debug() {
  const env = getEnv();
  if (!env) {
    console.log("No env data. (Postinstall didn't run.)");
  } else {
    console.log(JSON.stringify(env, null, 2));
  }
}
