import assert = require("assert");
import { symbolInfo, symbolSuccess, symbolError } from "../components/symbols";
import { fgBold } from "../components/colors";
import { ActivationKey } from "../../activationKey";
import { getActivationKeys } from "../../projectLsosConfig";
import { stringifyDate } from "../../utils/stringifyDate";

export { getPurchasedDaysLeft };

export { status };

export type PurchasedDaysLeft = { [key: string]: number };

async function status() {
  const purchasedDaysLeft = await getPurchasedDaysLeft();

  if (Object.keys(purchasedDaysLeft).length === 0) {
    console.log(symbolInfo + "No keys.");
  }

  Object.entries(purchasedDaysLeft).forEach(([tool, daysLeft]) => {
    assert(daysLeft >= 0);
    if (daysLeft > 0) {
      console.log(
        symbolSuccess +
          fgBold(tool) +
          " activated until " +
          fgBold(toDate(daysLeft))
      );
    } else {
      console.log(symbolError + fgBold(tool) + " activation expired.");
    }
  });
}

async function getPurchasedDaysLeft(): Promise<PurchasedDaysLeft> {
  const activationKeys = await getActivationKeys();

  const tools: { [key: string]: ActivationKey[] } = {};
  activationKeys.forEach((key) => {
    assert(key.tool);
    tools[key.tool] = tools[key.tool] || [];
    tools[key.tool].push(key);
  });

  const purchasedDaysLeft: PurchasedDaysLeft = {};
  Object.entries(tools).forEach(([tool, keys]) => {
    keys.sort((a, b) => epoch(a.issueDate) - epoch(b.issueDate));

    assert(keys.length >= 1);
    let daysLeft: number = keys[0].purchasedDays;
    let previousDate: string = keys[0].issueDate;

    keys.slice(1).forEach((key) => {
      assert(epoch(key.issueDate) >= epoch(previousDate));
      daysLeft = substractElapsedTime(daysLeft, previousDate, key.issueDate);
      daysLeft += key.purchasedDays;
      previousDate = key.issueDate;
    });

    daysLeft = substractElapsedTime(daysLeft, previousDate, new Date());

    purchasedDaysLeft[tool] = daysLeft;
  });

  return purchasedDaysLeft;
}

function toDate(daysLeft: number): string {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const expirationDate = new Date(new Date().getTime() + daysLeft * ONE_DAY);
  const skipDay = daysLeft > 3 * 31;
  return stringifyDate(expirationDate, { skipDay });
}

function substractElapsedTime(
  daysLeft: number,
  previousDate: string,
  currentDate: string | Date
) {
  const daysElapsed = epoch_days(currentDate) - epoch_days(previousDate);
  daysLeft = Math.max(0, daysLeft - daysElapsed);
  return daysLeft;
}

function epoch(str: string | Date): number {
  return new Date(str).getTime();
}
function epoch_days(str: string | Date): number {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return (epoch(str) / ONE_DAY) | 0;
}
