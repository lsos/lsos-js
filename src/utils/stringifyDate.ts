export { stringifyDate };

function stringifyDate(
  date: Date,
  { skipDay = false }: { skipDay?: boolean } = {}
): string {
  const dateComponents = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ];
  if (skipDay) dateComponents.splice(-1);
  const dateString = dateComponents.map(padZero).join("-");
  return dateString;
}

function padZero(n: number): string {
  if (n < 10) {
    return "0" + n;
  }
  return "" + n;
}
