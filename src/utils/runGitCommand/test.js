const { execCmd } = require("../../../dist/utils/runGitCommand/execCmd");

test();

async function test() {
  console.log(await execCmd("git --version"));
  try {
    console.log(await execCmd("iDontExist"));
  } catch (err) {
    console.log(err);
  }
}
