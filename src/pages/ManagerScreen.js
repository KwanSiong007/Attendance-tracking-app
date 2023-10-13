import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import WorksitePie from "../components/WorksitePie";
import ManagerAttendance from "../components/ManagerAttendance";
import { showCheckOutTime } from "../utils";
import DB_KEY from "../constants/dbKey";
import AttendanceLine from "../components/AttendanceLine";

function ManagerScreen() {
  const [nowLoaded, setNowLoaded] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [profiles, setProfiles] = useState(null);

  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  const [workerCount, setWorkerCount] = useState(0);
  const [countsByWorksite, setCountsByWorksite] = useState({});

  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down("mobile"));
  const attendanceLineHeight = isMobileScreen ? `calc(5/8 * 100vw)` : "300px";

  useEffect(() => {
    const nowLoaded = new Date();
    setNowLoaded(nowLoaded);

    const attendanceRef = ref(database, DB_KEY.CHECK_INS);
    const profilesRef = ref(database, DB_KEY.PROFILES);

    const unsubscribeAttendance = onValue(
      attendanceRef,
      (snapshot) => {
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
              nowLoaded
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
        let profiles = {};

        snapshot.forEach((childSnapshot) => {
          const row = childSnapshot.val();
          profiles[row.userId] = {
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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filteredAttendance = attendance.filter((row) =>
      profiles[row.userId].name.toLowerCase().includes(query.toLowerCase())
    );

    setPage(0);
    setFilteredAttendance(filteredAttendance);
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
              {["Log", "Charts"].map((label, index) => (
                <Tab label={label} key={index} />
              ))}
            </Tabs>
            {}
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
            <Container
              sx={{
                height: attendanceLineHeight,
              }}
            >
              <AttendanceLine nowLoaded={nowLoaded} attendance={attendance} />
            </Container>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <TextField
                id="outlined-basic"
                variant="outlined"
                label="Search by Name"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <ManagerAttendance
                nowLoaded={nowLoaded}
                attendance={filteredAttendance}
                profiles={profiles}
                page={page}
                setPage={setPage}
              />
            </Box>
          </>
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Container>
  );
}

export default ManagerScreen;
