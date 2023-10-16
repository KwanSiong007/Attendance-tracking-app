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

export const extractDate = (dateObj) => {
  return format(utcToZonedTime(dateObj, TIME_ZONE), "yyyy-MM-dd");
};

export const buildKey = (userId, dateObj) => {
  return `${userId}_${extractDate(dateObj)}`;
};

export const showDate = (isoString) => {
  const parsed = parseISO(isoString);
  return `${format(parsed, "EEE, d")}\u00A0${format(parsed, "MMM")}`;
};

export const showCurrDate = (dateObj) => {
  return format(utcToZonedTime(dateObj, TIME_ZONE), "EEE, d MMM");
};

export const showCheckInTime = (isoString) => {
  return format(parseISO(isoString), "h:mm aa");
};

export const showCheckOutTime = (checkInIso, checkOutIso, nowLoaded) => {
  if (checkOutIso) {
    return format(parseISO(checkOutIso), "h:mm aa");
  } else if (extractDate(parseISO(checkInIso)) === extractDate(nowLoaded)) {
    return "Pending";
  } else {
    return "Nil";
  }
};

export const showCheckInOutTime = (checkInIso, checkOutIso, nowLoaded) => {
  const checkInParsed = parseISO(checkInIso);
  const checkInStr = `${format(checkInParsed, "h:mm aa")}`;

  if (checkOutIso) {
    return `${checkInStr} \u2013 ${format(parseISO(checkOutIso), "h:mm aa")}`;
  } else if (extractDate(parseISO(checkInIso)) === extractDate(nowLoaded)) {
    return checkInStr;
  } else {
    return `${checkInStr} \u2013 Nil`;
  }
};

export const showTimeDiff = (checkInIso, checkOutIso, nowLoaded) => {
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

export const isWithinLastWeek = (checkInIso, nowLoaded) => {
  const checkInDate = utcToZonedTime(parseISO(checkInIso), TIME_ZONE);
  const dateLoaded = utcToZonedTime(nowLoaded, TIME_ZONE);
  const startDate = startOfDay(subDays(dateLoaded, 6));
  const endDate = endOfDay(dateLoaded);

  return isWithinInterval(checkInDate, { start: startDate, end: endDate });
};

export const getLastWeek = (nowLoaded) => {
  const dateLoaded = utcToZonedTime(nowLoaded, TIME_ZONE);
  const startDate = startOfDay(subDays(dateLoaded, 6));

  return [startDate, dateLoaded];
};

const getRandomTime = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

export const generateDummyCheckIns = () => {
  const userIds = [
    "QraQMwlSDOconsJCeGloNZowfFN2",
    "SYCE7o6TV4a6HmRmBPsMvCcv0zm1",
    "qIbUtgOWf7Sgtjd8F4tyZ6Lu8V73",
    "gmTxj107fkMcEE5fOaAEv6E0cx03",
    "pRxuCqrJybMy9dAZfBbMeVrJwd52",
    "nnWebmCOGSd4kQGUMJdNzvHp15s2",
    "TO3meGdg9fQGcGewKSXDtz9drqi2",
    "xTIXPEjfHJT8cEQ2SnAd2idwaCE2",
    "j5XD5AZEflhyyqshHo9CQ5UlFnu1",
    "ntaGHGbZbMQYhXzxfEz2pJVpkSl1",
    "4EfPJiYginQbZLIu814P2sKrehu2",
    "inkSeiy27ve5WGxH43rPIKCGCzl2",
  ];
  const worksites = ["Bedok", "Jurong West", "Novena", "Woodlands"];
  const startDate = new Date("2023-08-01T00:00:00.000+08:00");
  const endDate = new Date("2023-10-17T00:00:00.000+08:00");

  const dummyCheckIns = [];

  for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
    userIds.forEach((userId) => {
      const rand = Math.random() * 100;
      let checkIn, checkOut, worksite;

      // No check in (15%)
      if (rand < 15) return;

      worksite = worksites[Math.floor(Math.random() * worksites.length)];

      if (rand < 85) {
        // One check in (70%)
        checkIn = getRandomTime(
          new Date(d.setHours(6, 0, 0, 0)),
          new Date(d.setHours(8, 0, 0, 0))
        );
        checkOut =
          rand < 70
            ? getRandomTime(
                new Date(d.setHours(17, 0, 0, 0)),
                new Date(d.setHours(19, 0, 0, 0))
              )
            : // One check in, no check out (15%)
              null;
      } else {
        // Two check ins (10%)
        checkIn = getRandomTime(
          new Date(d.setHours(6, 0, 0, 0)),
          new Date(d.setHours(8, 0, 0, 0))
        );
        checkOut = getRandomTime(
          new Date(d.setHours(12, 0, 0, 0)),
          new Date(d.setHours(13, 0, 0, 0))
        );
        dummyCheckIns.push({
          userId: userId,
          checkInDateTime: checkIn.toISOString(),
          checkInKey: buildKey(userId, checkIn),
          checkOutDateTime: checkOut.toISOString(),
          worksite: worksite,
        });
        checkIn = getRandomTime(
          new Date(d.setHours(13, 0, 0, 0)),
          new Date(d.setHours(14, 0, 0, 0))
        );
        checkOut = getRandomTime(
          new Date(d.setHours(17, 0, 0, 0)),
          new Date(d.setHours(19, 0, 0, 0))
        );
      }

      dummyCheckIns.push({
        userId: userId,
        checkInDateTime: checkIn.toISOString(),
        checkInKey: buildKey(userId, checkIn),
        checkOutDateTime: checkOut ? checkOut.toISOString() : null,
        worksite: worksite,
      });
    });
  }

  dummyCheckIns.sort(
    (a, b) => new Date(a.checkInDateTime) - new Date(b.checkInDateTime)
  );

  return dummyCheckIns;
};

export const VisuallyHiddenInput = styled("input")({
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
