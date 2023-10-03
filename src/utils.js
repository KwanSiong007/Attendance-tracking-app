import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const extractDaySGT = (date) => {
  return format(utcToZonedTime(date, "Asia/Singapore"), "yyyy-MM-dd");
};

export { extractDaySGT };
