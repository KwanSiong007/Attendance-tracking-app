import React, { useState } from "react";
import {
  Avatar,
  Box,
  Divider,
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
          <React.Fragment key={`${row.userId}_${row.checkInDateTime}`}>
            <ListItem alignItems="flex-start" sx={{ py: 0.5 }}>
              <ListItemAvatar>
                <Avatar
                  src={profiles[row.userId].photoUrl}
                  sx={{ width: 40, height: 40 }}
                  variant="square"
                ></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={profiles[row.userId].name}
                secondary={[
                  <Typography
                    key="line1"
                    component="span"
                    display="block"
                    variant="body2"
                  >
                    {showDate(row.checkInDateTime)} @ {row.worksite}
                  </Typography>,
                  <Typography
                    key="line2"
                    component="span"
                    display="block"
                    variant="body2"
                  >
                    {showCheckInOutTime(
                      row.checkInDateTime,
                      row.checkOutDateTime,
                      nowLoaded
                    )}
                  </Typography>,
                ]}
              />
            </ListItem>
            <Divider variant="inset" />
          </React.Fragment>
        ))}
      </List>
    );
  }
}

export default ManagerAttendance;
