import React, { useState, useEffect } from "react";
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
  TablePagination,
  Typography,
  CircularProgress,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import InfiniteScroll from "react-infinite-scroll-component";

import {
  showDate,
  showCheckInTime,
  showCheckOutTime,
  showCheckInOutTime,
  showTimeDiff,
} from "../utils";

function ManagerAttendance({ nowLoaded, attendance, profiles, page, setPage }) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [items, setItems] = useState(attendance.slice(0, 10));
  const [hasMore, setHasMore] = useState(true);

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

  useEffect(() => {
    setItems(attendance.slice(0, 10));
    setHasMore(true);
  }, [attendance]);

  const fetchItems = () => {
    if (items.length >= attendance.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setItems(attendance.slice(0, items.length + 10));
    }, 500);
  };

  if (!isMobileScreen) {
    return (
      <>
        <TablePagination
          component={Paper}
          rowsPerPageOptions={[10, 25, 50]}
          count={attendance.length}
          rowsPerPage={rowsPerPage}
          page={page}
          SelectProps={{
            inputProps: {
              id: "rows-per-page",
              "aria-label": "rows per page",
            },
          }}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <TableContainer
          component={Paper}
          sx={{ overflowX: "auto", width: "100%" }}
        >
          <Table size="small" sx={{ width: "100%" }}>
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
                    <TableCell>
                      {showCheckInTime(row.checkInDateTime)}
                    </TableCell>
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
          </Table>
        </TableContainer>
      </>
    );
  } else {
    return (
      <InfiniteScroll
        className="infinite-scroll"
        overflowY="hidden"
        dataLength={items.length}
        next={fetchItems}
        hasMore={hasMore}
        loader={<CircularProgress />}
        endMessage={<Typography>No more records</Typography>}
        scrollThreshold="200px"
        style={{ overflow: "hidden" }}
      >
        <List>
          {items.map((row) => (
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
      </InfiniteScroll>
    );
  }
}

export default ManagerAttendance;
