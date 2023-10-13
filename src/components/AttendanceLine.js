import { ResponsiveLine } from "@nivo/line";
import { BasicTooltip } from "@nivo/tooltip";
import { format } from "date-fns";

function CustomTooltip({ point }) {
  const { x, y } = point.data;
  const xLabel = format(new Date(x), "EEE, d MMM");
  return <BasicTooltip id={xLabel} value={y} color={point.color} enableChip />;
}

function AttendanceLine({ lineData }) {
  const lineProps = {
    data: lineData,
    tooltip: CustomTooltip,
    margin: { top: 25, bottom: 25, left: 50, right: 50 },
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
        tooltip: {
          container: {
            fontSize: "0.875rem",
          },
        },
      },
    },
  };

  return <ResponsiveLine {...lineProps} />;
}

export default AttendanceLine;
