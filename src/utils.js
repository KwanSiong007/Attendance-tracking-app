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
  const diffHours = differenceInHours(end, start);
  const diffMinutes = differenceInMinutes(end, start) % 60;

  if (diffHours === 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`;
  } else if (diffMinutes === 0) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  } else {
    return `${diffHours} hour${
      diffHours === 1 ? "" : "s"
    } ${diffMinutes} minute${diffMinutes === 1 ? "" : "s"}`;
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
