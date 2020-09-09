/*
import { UserConfig } from "../UserConfig";
import { splitByLine } from "../utils/split";
*/
import { symbolInfo, symbolSuccess, stylePath } from "@lsos/utils";
import { EOL } from "os";

export { activate };

function activate() {
  console.log("a");
  /*
  const isAlreadyRemoved: boolean = UserConfig.get()?.donationReminder?.remove;

  if (!isAlreadyRemoved) {
    UserConfig.set({
      donationReminder: {
        remove: true,
      },
    });
  }

  console.log(
    (isAlreadyRemoved ? symbolInfo : symbolSuccess) +
      "Lsos config " +
      (isAlreadyRemoved ? "" : "saved ") +
      "at " +
      stylePath(UserConfig.configFilePath) +
      ":"
  );
  console.log(prettyUserConfig());

  console.log();
  if (isAlreadyRemoved) {
    console.log(symbolInfo + "Donation-reminder already removed.");
  } else {
    console.log(symbolSuccess + "Donation-reminder successfully removed.");
  }
  console.log();

  console.log(
    symbolInfo + "More info at https://github.com/Lsos/donation-reminder."
  );
  console.log();
  */
}

/*
function prettyUserConfig() {
  const userConfig = UserConfig.get();
  const lines = splitByLine(JSON.stringify(userConfig, null, 2));
  const TAB = "    ";
  const withTabs = lines.map((line) => TAB + line).join(EOL);
  return withTabs;
}
*/
