import { getEnv } from "../../env/getEnv";

export { debug };

function debug() {
  console.log(JSON.stringify(getEnv(), null, 2));
}
