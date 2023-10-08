import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import ManagerAttendance from "../components/ManagerAttendance";
import {
  Box,
  Container,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const DB_ATTENDANCE_KEY = "checkIns";
const DB_PROFILE_KEY = "profiles";

function ManagerScreen() {
  const [nowLoaded, setNowLoaded] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);

  useEffect(() => {
    const nowLoaded = new Date();
    setNowLoaded(nowLoaded);

    const attendanceRef = ref(database, DB_ATTENDANCE_KEY);
    const profilesRef = ref(database, DB_PROFILE_KEY);

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
        console.log("sortedAttendance:", sortedAttendance);
        setAttendance(sortedAttendance);
        setFilteredAttendance(sortedAttendance);
      },
      { onlyOnce: false }
    );

    const unsubscribeProfiles = onValue(
      profilesRef,
      (snapshot) => {
        let photos = {};

        snapshot.forEach((childSnapshot) => {
          const row = childSnapshot.val();
          if (row.photoUrl) {
            photos[row.userId] = row.photoUrl;
          }
        });

        console.log(photos);
        setPhotos(photos);
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
    const filteredRecords = attendance.filter((record) =>
      record.username.toLowerCase().includes(query.toLowerCase())
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
          nowLoaded={nowLoaded}
        />
      </Box>
    </Container>
  );
}

export default ManagerScreen;
