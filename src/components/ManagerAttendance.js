import { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Avatar,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TablePagination,
  Typography,
} from "@mui/material";
import {
  showDate,
  showCheckInTime,
  showCheckOutTime,
  showTimeDiff,
} from "../utils";

const theme = createTheme({
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({ fontSize: theme.typography.body2.fontSize }),
      },
    },
  },
});

function ManagerAttendance({ attendance, profiles, nowLoaded }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (!attendance || !profiles) {
    return;
  }

  return (
    <ThemeProvider theme={theme}>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                "Date",
                "Worker",
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
                  key={`${row.userId}_${row.checkInDateTime}`}
                  sx={{
                    backgroundColor:
                      index % 2 === 1 ? "action.hover" : "transparent",
                  }}
                >
                  <TableCell>{showDate(row.checkInDateTime)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.25 }}
                    >
                      <Avatar
                        src={profiles[row.userId].photoUrl}
                        sx={{ width: 40, height: 40 }}
                        variant="square"
                      ></Avatar>
                      <Typography variant="body2">
                        {profiles[row.userId].name}
                      </Typography>
                    </Box>
                  </TableCell>
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
                rowsPerPageOptions={[10, 25, 50]}
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
      </TableContainer>
    </ThemeProvider>
  );
}

export default ManagerAttendance;
