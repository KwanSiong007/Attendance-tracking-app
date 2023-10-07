import {
  format,
  parseISO,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { styled } from "@mui/material/styles";

const buildKey = (userID, dateObj) => {
  const dateStr = format(
    utcToZonedTime(dateObj, "Asia/Singapore"),
    "yyyy-MM-dd"
  );
  return `${userID}_${dateStr}`;
};

const showDate = (isoString) => {
  return format(parseISO(isoString), "EEE, d MMM");
};

const showTime = (isoString) => {
  return isoString ? format(parseISO(isoString), "h:mm aa") : "";
};

const showTimeDiff = (isoStart, isoEnd) => {
  if (!isoEnd) {
    return "";
  }

  const start = parseISO(isoStart);
  const end = parseISO(isoEnd);
  const hoursDiff = differenceInHours(end, start);
  const minsDiff = differenceInMinutes(end, start) % 60;

  const hoursStr = `${hoursDiff} hour${hoursDiff === 1 ? "" : "s"}`;
  const minsStr = `${minsDiff} min${minsDiff === 1 ? "" : "s"}`;

  if (hoursDiff === 0) {
    return hoursStr;
  } else if (minsDiff === 0) {
    return minsStr;
  } else {
    return hoursStr + " " + minsStr;
  }
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export { buildKey, showDate, showTime, showTimeDiff, VisuallyHiddenInput };
