import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
} from "@mui/material";
import {
  showDate,
  showCheckInTime,
  showCheckOutTime,
  showTimeDiff,
} from "../utils";

const ROWS_PER_PAGE = 10;

function WorkerAttendance({ attendance, nowLoaded }) {
  const [page, setPage] = useState(0);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          {[
            "Date",
            "Work Site",
            "Check In Time",
            "Check Out Time",
            "Duration Worked",
          ].map((headCell) => (
            <TableCell key={headCell} sx={{ fontWeight: "bold" }}>
              {headCell}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {attendance
          .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)
          .map((row, index) => (
            <TableRow
              key={`${row.userId}_${row.checkInDateTime}`}
              sx={{
                backgroundColor:
                  index % 2 === 1 ? "transparent" : "action.hover",
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
              <TableCell>
                {showTimeDiff(
                  row.checkInDateTime,
                  row.checkOutDateTime,
                  nowLoaded
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            rowsPerPageOptions={[]}
            colSpan={5}
            count={attendance.length}
            rowsPerPage={ROWS_PER_PAGE}
            page={page}
            onPageChange={handleChangePage}
          />
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default WorkerAttendance;
