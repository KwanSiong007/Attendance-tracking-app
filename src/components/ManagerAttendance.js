import { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
} from "@mui/material";
import { showDate, showTime, showTimeDiff } from "../utils";

const theme = createTheme({
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({ fontSize: theme.typography.body2.fontSize }),
      },
    },
  },
});

function ManagerAttendance({ attendance }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <ThemeProvider theme={theme}>
      <Table>
        <TableHead>
          <TableRow>
            {[
              "Date",
              "Name",
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
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => (
              <TableRow
                key={row.checkInKey}
                sx={{
                  backgroundColor:
                    index % 2 === 1 ? "action.hover" : "transparent",
                }}
              >
                <TableCell>{showDate(row.checkInDateTime)}</TableCell>
                <TableCell>{row.username}</TableCell>
                <TableCell>{row.worksite}</TableCell>
                <TableCell>{showTime(row.checkInDateTime)}</TableCell>
                <TableCell>{showTime(row.checkOutDateTime)}</TableCell>
                <TableCell>
                  {showTimeDiff(row.checkInDateTime, row.checkOutDateTime)}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              colSpan={6}
              count={attendance.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  "aria-label": "rows per page",
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </ThemeProvider>
  );
}

export default ManagerAttendance;
