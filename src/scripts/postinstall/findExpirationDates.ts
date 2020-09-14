import { replaceFileContent } from "@lsos/utils/dist/replaceFileContent";
import { getPurchasedDaysLeft, PurchasedDaysLeft } from "../cli/status";

type ExpirationDates = { [key: string]: Date };

export { findExpirationDates };

async function findExpirationDates() {
  const expirationDates = await getExpirationDates();

  replaceFileContent(
    require.resolve("../../env/expirationDates.js"),
    "expirationDates",
    expirationDates
  );
}

async function getExpirationDates(): Promise<ExpirationDates> {
  const purchasedDaysLeft: PurchasedDaysLeft = await getPurchasedDaysLeft();

  const expirationDates: ExpirationDates = {};

  Object.entries(purchasedDaysLeft).forEach(([npmName, daysLeft]) => {
    expirationDates[npmName] = getExpirationDate(daysLeft);
  });

  return expirationDates;
}

function getExpirationDate(daysLeft: number): Date {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const expirationDate__epoch = new Date().getTime() + daysLeft * ONE_DAY;
  const expirationDate__epoch__rounded =
    Math.ceil(expirationDate__epoch / ONE_DAY) * ONE_DAY;
  const expirationDate = new Date(expirationDate__epoch__rounded);
  return expirationDate;
}
