import {
  format,
  parseISO,
  differenceInHours,
  differenceInMinutes,
  isWithinInterval,
  startOfDay,
  subDays,
  endOfDay,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { styled } from "@mui/material/styles";

const TIME_ZONE = "Asia/Singapore";

const extractDate = (dateObj) => {
  return format(utcToZonedTime(dateObj, TIME_ZONE), "yyyy-MM-dd");
};

const buildKey = (userId, dateObj) => {
  return `${userId}_${extractDate(dateObj)}`;
};

const showDate = (isoString, isSmallScreen) => {
  if (!isSmallScreen) {
    return format(parseISO(isoString), "EEE, d MMM");
  } else {
    return format(parseISO(isoString), "d MMM");
  }
};

const showCurrDate = (dateObj) => {
  return format(utcToZonedTime(dateObj, TIME_ZONE), "EEE, d MMM");
};

const showCheckInTime = (isoString) => {
  return format(parseISO(isoString), "h:mm aa");
};

const showCheckOutTime = (checkInIso, checkOutIso, nowLoaded) => {
  if (checkOutIso) {
    return format(parseISO(checkOutIso), "h:mm aa");
  } else if (extractDate(parseISO(checkInIso)) === extractDate(nowLoaded)) {
    return "Pending";
  } else {
    return "Nil";
  }
};

const showTimeDiff = (checkInIso, checkOutIso, nowLoaded) => {
  if (checkOutIso) {
    const start = parseISO(checkInIso);
    const end = parseISO(checkOutIso);
    const hoursDiff = differenceInHours(end, start);
    const minsDiff = differenceInMinutes(end, start) % 60;

    const hoursStr = `${hoursDiff} h`;
    const minsStr = `${minsDiff} min`;

    if (hoursDiff === 0) {
      return minsStr;
    } else if (minsDiff === 0) {
      return hoursStr;
    } else {
      return hoursStr + " " + minsStr;
    }
  } else if (extractDate(parseISO(checkInIso)) === extractDate(nowLoaded)) {
    return "Pending";
  } else {
    return "Nil";
  }
};

const isWithinLastWeek = (checkInIso, nowLoaded) => {
  const checkInDate = utcToZonedTime(parseISO(checkInIso), TIME_ZONE);
  const dateLoaded = utcToZonedTime(nowLoaded, TIME_ZONE);
  const startDate = startOfDay(subDays(dateLoaded, 6));
  const endDate = endOfDay(dateLoaded);

  return isWithinInterval(checkInDate, { start: startDate, end: endDate });
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

export {
  extractDate,
  buildKey,
  showDate,
  showCurrDate,
  showCheckInTime,
  showCheckOutTime,
  showTimeDiff,
  isWithinLastWeek,
  VisuallyHiddenInput,
};
