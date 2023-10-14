import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import {
  showDate,
  showCheckInTime,
  showCheckOutTime,
  showTimeDiff,
} from "../utils";

function WorkerAttendance({ attendance, nowLoaded }) {
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down("mobile"));

  return (
    <Table>
      <TableHead>
        <TableRow>
          {["Date", "Work Site", "Check In Time", "Check Out Time"].map(
            (headCell) => (
              <TableCell key={headCell} sx={{ fontWeight: "bold" }}>
                {headCell}
              </TableCell>
            )
          )}
          {!isMobileScreen && (
            <TableCell key="Duration Worked" sx={{ fontWeight: "bold" }}>
              Duration Worked
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {attendance.map((row, index) => (
          <TableRow
            key={`${row.userId}_${row.checkInDateTime}`}
            sx={{
              backgroundColor: index % 2 === 1 ? "transparent" : "action.hover",
            }}
          >
            <TableCell>{showDate(row.checkInDateTime)}</TableCell>
            <TableCell>{row.worksite}</TableCell>
            <TableCell>{showCheckInTime(row.checkInDateTime)}</TableCell>
            <TableCell>
              {showCheckOutTime(
                row.checkInDateTime,
                row.checkOutDateTime,
                nowLoaded
              )}
            </TableCell>
            {!isMobileScreen && (
              <TableCell>
                {showTimeDiff(
                  row.checkInDateTime,
                  row.checkOutDateTime,
                  nowLoaded
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default WorkerAttendance;
