import { useState } from "react";
import {
  Avatar,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import {
  showDate,
  showCheckInTime,
  showCheckOutTime,
  showCheckInOutTime,
  showTimeDiff,
} from "../utils";

function ManagerAttendance({ nowLoaded, attendance, profiles, page, setPage }) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down("mobile"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (!isMobileScreen) {
    return (
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
              ].map((headCell) => (
                <TableCell key={headCell} sx={{ fontWeight: "bold" }}>
                  {headCell}
                </TableCell>
              ))}
              {!isMediumScreen && (
                <TableCell key="Duration Worked" sx={{ fontWeight: "bold" }}>
                  Duration Worked
                </TableCell>
              )}
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
                      index % 2 === 1 ? "transparent" : "action.hover",
                  }}
                >
                  <TableCell>{showDate(row.checkInDateTime)}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
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
                  {!isMediumScreen && (
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
    );
  } else {
    return (
      <List>
        {attendance.map((row) => (
          <ListItem key={`${row.userId}_${row.checkInDateTime}`}>
            <ListItemAvatar>
              <Avatar
                src={profiles[row.userId].photoUrl}
                sx={{ width: 40, height: 40 }}
                variant="square"
              ></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={profiles[row.userId].name}
              secondary={
                <>
                  <div>
                    @ {row.worksite} on {showDate(row.checkInDateTime)}
                  </div>
                  <div>
                    {showCheckInOutTime(
                      row.checkInDateTime,
                      row.checkOutDateTime,
                      nowLoaded
                    )}
                  </div>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  }
}

export default ManagerAttendance;
