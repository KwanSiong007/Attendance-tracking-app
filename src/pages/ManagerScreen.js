import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import {
  Box,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import ManagerAttendance from "../components/ManagerAttendance";
import DB_KEYS from "../constants/dbKeys";

function ManagerScreen() {
  const [nowLoaded, setNowLoaded] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [profiles, setProfiles] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  useEffect(() => {
    const nowLoaded = new Date();
    setNowLoaded(nowLoaded);

    const attendanceRef = ref(database, DB_KEYS.CHECK_INS);
    const profilesRef = ref(database, DB_KEYS.PROFILES);

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
            photoUrl: row.photoUrl,
          };
        });

        setProfiles(profiles);
      },
      { onlyOnce: false }
    );

    return () => {
      unsubscribeAttendance();
      unsubscribeProfiles();
    };
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    const filteredRecords = attendance.filter((row) =>
      profiles[row.userId].name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredAttendance(filteredRecords);
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        {attendance && profiles ? (
          <>
            <TextField
              id="outlined-basic"
              variant="outlined"
              label="Search by Name"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ alignSelf: "flex-start" }}
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
              attendance={filteredAttendance}
              profiles={profiles}
              nowLoaded={nowLoaded}
            />
          </>
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Container>
  );
}

export default ManagerScreen;
