import { useCallback, useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";

import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import DateRangePicker from "@wojtekmaj/react-daterange-picker";

import "../styles/DateRangePicker.css";
import "../styles/Calendar.css";
import { format } from "date-fns";

import WorksitePie from "../components/WorksitePie";
import ManagerAttendance from "../components/ManagerAttendance";
import { showCheckOutTime, getLastWeek } from "../utils";
import DB_KEY from "../constants/dbKey";
import AttendanceLine from "../components/AttendanceLine";

function ManagerScreen() {
  const nowLoaded = useRef(new Date());
  const [attendance, setAttendance] = useState([]);
  const [profiles, setProfiles] = useState(null);

  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);

  const [nameQuery, setSearchQuery] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  const [workerCount, setWorkerCount] = useState(0);
  const [countsByWorksite, setCountsByWorksite] = useState({});
  const [dateRange, setDateRange] = useState(getLastWeek(new Date()));

  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down("mobile"));
  const attendanceLineHeight = isMobileScreen ? `calc(5/8 * 100vw)` : "300px";

  useEffect(() => {
    const attendanceRef = ref(database, DB_KEY.CHECK_INS);
    const profilesRef = ref(database, DB_KEY.PROFILES);

    const unsubscribeAttendance = onValue(
      attendanceRef,
      (snapshot) => {
        nowLoaded.current = new Date();

        let attendance = [];

        snapshot.forEach((childSnapshot) => {
          const row = childSnapshot.val();
          attendance.push(row);
        });

        const sortedAttendance = [...attendance].sort(
          (a, b) =>
            Date.parse(b.checkInDateTime) - Date.parse(a.checkInDateTime)
        );

        setAttendance(sortedAttendance);
        setFilteredAttendance(sortedAttendance);

        const countsByWorksite = attendance.reduce((acc, row) => {
          if (
            row.checkInDateTime &&
            showCheckOutTime(
              row.checkInDateTime,
              row.checkOutDateTime,
              nowLoaded.current
            ) === "Pending"
          ) {
            acc[row.worksite] = (acc[row.worksite] || 0) + 1;
          }
          return acc;
        }, {});

        setCountsByWorksite(countsByWorksite);
      },
      { onlyOnce: false }
    );

    const unsubscribeProfiles = onValue(
      profilesRef,
      (snapshot) => {
        nowLoaded.current = new Date();

        let profiles = {};

        snapshot.forEach((childSnapshot) => {
          const row = childSnapshot.val();
          profiles[childSnapshot.key] = {
            name: row.name,
            role: row.role,
            photoUrl: row.photoUrl,
          };
        });

        setProfiles(profiles);

        const workerCount = Object.values(profiles).reduce((count, profile) => {
          return count + (profile.role === "worker" ? 1 : 0);
        }, 0);

        setWorkerCount(workerCount);
      },
      { onlyOnce: false }
    );

    return () => {
      unsubscribeAttendance();
      unsubscribeProfiles();
    };
  }, []);

  const handleTabChange = (e, newTab) => {
    setTab(newTab);
  };

  const handleFilterChange = useCallback(() => {
    let filtered = [...attendance];

    if (nameQuery) {
      filtered = filtered.filter((row) =>
        profiles[row.userId].name
          .toLowerCase()
          .includes(nameQuery.toLowerCase())
      );
    }

    const [startDate, endDate] = dateRange;

    filtered = filtered.filter((row) => {
      const checkInDateTime = new Date(row.checkInDateTime);
      return checkInDateTime >= startDate && checkInDateTime < endDate;
    });

    setPage(0);
    setFilteredAttendance(filtered);
  }, [attendance, profiles, nameQuery, dateRange]);

  useEffect(() => {
    handleFilterChange();
  }, [nameQuery, dateRange, handleFilterChange]);

  const handleNameQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (dateRange) => {
    if (!dateRange) {
      setDateRange(getLastWeek(nowLoaded.current));
      return;
    }
    setDateRange(dateRange);
  };

  const formatMonthYear = (locale, date) => {
    return format(date, "MMM yyyy");
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          mb: 2,
        }}
      >
        {attendance && profiles && workerCount && countsByWorksite ? (
          <>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant={isMobileScreen ? "fullWidth" : "standard"}
            >
              {["Log", "Dashboard"].map((label, index) => (
                <Tab label={label} key={index} />
              ))}
            </Tabs>

            {tab === 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "center", mobile: "flex-start" },
                  gap: 1,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", mobile: "row" },
                    alignItems: { xs: "stretch", mobile: "normal" },
                    gap: { xs: 2, mobile: 3 },
                    width: { xs: "100%", mobile: "auto" },
                    maxWidth: { xs: "275px", mobile: "100%" },
                  }}
                >
                  <TextField
                    variant="outlined"
                    label="Worker Name"
                    value={nameQuery}
                    onChange={handleNameQueryChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton>
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      maxWidth: "330px",
                      "& .MuiOutlinedInput-root": {
                        paddingRight: 0,
                      },
                      "& .MuiOutlinedInput-input": {
                        height: "50px",
                        paddingBlock: 0,
                        fontSize: "0.875rem",
                      },
                      "& .MuiInputLabel-outlined": {
                        transition:
                          "transform 200ms cubic-bezier(0, 0, 0.2, 1), top 200ms cubic-bezier(0, 0, 0.2, 1), font-size 200ms cubic-bezier(0, 0, 0.2, 1)",
                        "&:not(.MuiInputLabel-shrink)": {
                          fontSize: "0.875rem",
                          top: "50%",
                          transform: "translate(0.875rem, -50%)",
                        },
                        "&.MuiInputLabel-shrink": {
                          top: 0,
                          transform:
                            "translate(0.875rem, 0) scale(0.75) transform(0, -50%)",
                        },
                      },
                    }}
                  />
                  <DateRangePicker
                    onChange={handleDateRangeChange}
                    value={dateRange}
                    formatMonthYear={formatMonthYear}
                  />
                </Box>
                <ManagerAttendance
                  nowLoaded={nowLoaded.current}
                  attendance={filteredAttendance}
                  profiles={profiles}
                  page={page}
                  setPage={setPage}
                />
              </Box>
            )}

            {tab === 1 && (
              <>
                <Typography variant="h6">
                  Workers by Current Location
                </Typography>
                <Container
                  sx={{
                    height: "300px",
                  }}
                >
                  <WorksitePie
                    workerCount={workerCount}
                    countsByWorksite={countsByWorksite}
                  />
                </Container>
                <Typography variant="h6">Attendance for Last 7 Days</Typography>
                <Container
                  sx={{
                    height: attendanceLineHeight,
                  }}
                >
                  <AttendanceLine
                    nowLoaded={nowLoaded.current}
                    attendance={attendance}
                  />
                </Container>
              </>
            )}
          </>
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Container>
  );
}

export default ManagerScreen;
