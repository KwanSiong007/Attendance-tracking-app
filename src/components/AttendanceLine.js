import { ResponsiveLine } from "@nivo/line";
import { BasicTooltip } from "@nivo/tooltip";
import { format, eachDayOfInterval } from "date-fns";

import { extractDate, getLastWeek, isWithinLastWeek } from "../utils";

function CustomTooltip({ point }) {
  const { x, y } = point.data;
  const xLabel = format(new Date(x), "EEE, d MMM");
  return <BasicTooltip id={xLabel} value={y} color={point.color} enableChip />;
}

function AttendanceLine({ nowLoaded, attendance }) {
  const [startDate, dateLoaded] = getLastWeek(nowLoaded);

  const getZeroWorkers = (startDate, endDate) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return Object.fromEntries(days.map((day) => [extractDate(day), new Set()]));
  };

  const workersLastWeek = Object.values(attendance).reduce((acc, row) => {
    if (isWithinLastWeek(row.checkInDateTime, nowLoaded)) {
      const dateLoaded = extractDate(row.checkInDateTime);
      acc[dateLoaded].add(row.userId);
    }
    return acc;
  }, getZeroWorkers(startDate, dateLoaded));

  const attendanceLastWeek = Object.fromEntries(
    Object.entries(workersLastWeek).map(([date, users]) => [date, users.size])
  );

  const lineData = [
    {
      id: "attendance",
      data: Object.entries(attendanceLastWeek).map(([x, y]) => ({
        x,
        y,
      })),
    },
  ];

  const lineProps = {
    data: lineData,
    tooltip: CustomTooltip,
    margin: { top: 25, bottom: 25, left: 40, right: 40 },
    xScale: { type: "time", format: "%Y-%m-%d" },
    xFormat: "time:%Y-%m-%d",
    yScale: {
      type: "linear",
      min: 0,
      max: "auto",
    },
    axisBottom: {
      format: "%a",
      tickValues: "every day",
    },
    axisLeft: {
      legend: "Attendance",
      legendPosition: "middle",
      legendOffset: -35,
    },
    colors: { scheme: "set2" },
    pointSize: 10,
    useMesh: true,
    curve: "monotoneX",
    enableGridX: false,
    enableGridY: false,
    theme: {
      axis: {
        ticks: {
          text: {
            fontSize: "0.875rem",
          },
        },
        legend: {
          text: {
            fontSize: "0.875rem",
            fontWeight: "bold",
          },
        },
      },
    },
  };

  return <ResponsiveLine {...lineProps} />;
}

export default AttendanceLine;
