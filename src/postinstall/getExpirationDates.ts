import {
  getPurchasedDaysLeft,
  PurchasedDaysLeft,
} from "../cli/commands/status";

export type ExpirationDates = { [key: string]: number };

export { getExpirationDates };

async function getExpirationDates(): Promise<ExpirationDates> {
  const purchasedDaysLeft: PurchasedDaysLeft = await getPurchasedDaysLeft();

  const expirationDates: ExpirationDates = {};

  Object.entries(purchasedDaysLeft).forEach(([npm, daysLeft]) => {
    expirationDates[npm] = getExpirationDate(daysLeft).getTime();
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
