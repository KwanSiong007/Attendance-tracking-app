import { ResponsiveLine } from "@nivo/line";

function AttendanceLine({ lineData }) {
  const lineProps = {
    data: lineData,
  };

  return <ResponsiveLine {...lineProps} />;
}

export default AttendanceLine;
