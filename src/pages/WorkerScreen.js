import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { point } from "@turf/helpers";
import { default as findDistance } from "@turf/distance";
import { buildKey, showDate, showTime, showTimeDiff } from "../utils";
import {
  push,
  ref,
  set,
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
} from "firebase/database";
import { database } from "../firebase";

const DB_ATTENDANCE_RECORDS_KEY = "action";

const GPS_STATUS = {
  OFF: "off",
  REQUESTING: "requesting",
  ON: "on",
  NOT_SUPPORTED: "not-supported",
  DENIED: "denied",
  ERROR: "error",
};

function WorkerScreen({ userData }) {
  const [attendance, setAttendance] = useState([]);
  const [checkedIn, setCheckedIn] = useState(null);
  const [checkedInSite, setCheckedInSite] = useState(null);
  const [recordId, setRecordId] = useState(null);

  const [gpsStatus, setGpsStatus] = useState(GPS_STATUS.OFF);
  const [gpsSite, setGpsSite] = useState(null);

  useEffect(() => {
    const searchKey = buildKey(userData.userID, new Date());
    const recordsRef = ref(database, DB_ATTENDANCE_RECORDS_KEY);
    const q = query(recordsRef, orderByChild("checkInKey"), equalTo(searchKey));

    const unsubscribe = onValue(
      q,
      (snapshot) => {
        const attendance = [];
        let checkedIn = false;
        let site = null;
        let recordId = null;

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const record = childSnapshot.val();
            attendance.push({
              worksite: record.worksite,
              checkInDateTime: record.checkInDateTime,
              checkOutDateTime: record.checkOutDateTime,
            });

            if (!record.checkOutDateTime) {
              checkedIn = true;
              site = record.worksite;
              recordId = childSnapshot.key;
            }
          });
        }

        setAttendance(attendance);
        console.log(attendance);
        setCheckedIn(checkedIn);
        setCheckedInSite(site);
        setRecordId(recordId);
      },
      {
        onlyOnce: false,
      }
    );

    return () => unsubscribe();
  }, [userData.userID]);

  const sites = [
    {
      name: "Tanjong Pagar MRT",
      coordinates: { lat: 1.276650525561771, lng: 103.845886249542 },
      radius: 1,
    },
    {
      name: "Woodlands MRT",
      coordinates: { lat: 1.437147546683729, lng: 103.78643347255546 },
      radius: 1,
    },
    {
      name: "Singapore", // for debugging
      coordinates: { lat: 1.283333, lng: 103.833333 },
      radius: 99999,
    },
    // ...other sites
  ];

  const writeCheckIn = (site) => {
    const searchKey = buildKey(userData.userID, new Date());
    const recordsRef = ref(database, DB_ATTENDANCE_RECORDS_KEY);
    const newRecordRef = push(recordsRef);

    setCheckedIn(true);
    setRecordId(newRecordRef.key);
    set(newRecordRef, {
      checkInDateTime: new Date().toISOString(),
      checkInKey: searchKey,
      username: userData.username,
      worksite: site.name,
    });
  };

  const checkSite = (lat, lng) => {
    const userPoint = point([lat, lng]);
    for (let site of sites) {
      const sitePoint = point([site.coordinates.lat, site.coordinates.lng]);
      const distance = findDistance(userPoint, sitePoint);
      console.log(`Distance of ${distance} km from ${site.name}.`);
      if (distance < site.radius) {
        writeCheckIn(site);
        setGpsSite(site.name);
        return;
      }
    }
    setGpsSite(null);
  };

  const handleCheckIn = () => {
    if (!("geolocation" in navigator)) {
      setGpsStatus(GPS_STATUS.NOT_SUPPORTED);
      return;
    }

    setGpsStatus(GPS_STATUS.REQUESTING);

    navigator.permissions
      .query({ name: "geolocation" })
      .then(function (result) {
        if (result.state === "denied") {
          setGpsStatus(GPS_STATUS.DENIED);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGpsStatus(GPS_STATUS.ON);
            const { latitude, longitude } = position.coords;
            checkSite(latitude, longitude);
          },
          (error) => {
            console.error(error);
            if (error.code === 1) {
              setGpsStatus(GPS_STATUS.DENIED);
            } else {
              setGpsStatus(GPS_STATUS.ERROR);
            }
          },
          { enableHighAccuracy: true }
        );
      });
  };

  const handleCheckOut = () => {
    const recordRef = ref(database, `${DB_ATTENDANCE_RECORDS_KEY}/${recordId}`);
    setCheckedIn(false);
    setRecordId(null);
    update(recordRef, {
      checkOutDateTime: new Date().toISOString(),
    });
  };

  const gpsStatusMsg = () => {
    switch (gpsStatus) {
      case GPS_STATUS.REQUESTING:
        return "Requesting location access.";
      case GPS_STATUS.ON:
        if (gpsSite) {
          return `Your current location is ${gpsSite}.`;
        } else {
          return "Your current location is not at a work site.";
        }
      case GPS_STATUS.NOT_SUPPORTED:
        return "Location access not supported. Please use a compatible browser.";
      case GPS_STATUS.DENIED:
        return "Location access denied. Please grant access to confirm you're at a work site.";
      case GPS_STATUS.ERROR:
        return "Location access error. Please contact support.";
      default:
        return;
    }
  };

  const attendanceMsg = () => {
    if (checkedIn === true) {
      return `Checked in at ${checkedInSite}.`;
    } else if (checkedIn === false) {
      return "Checked out.";
    }
  };

  const sortedAttendance = [...attendance].sort(
    (a, b) => Date.parse(b.checkInDateTime) - Date.parse(a.checkInDateTime)
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mb: 2,
      }}
    >
      <Typography>{attendanceMsg()}</Typography>
      {checkedIn === false && (
        <Button
          onClick={handleCheckIn}
          variant="contained"
          sx={{
            borderRadius: "50%",
            width: "110px",
            height: "110px",
            textTransform: "none",
            backgroundColor: "darkgreen",
            "&:hover": {
              backgroundColor: "green",
            },
          }}
        >
          Check In
        </Button>
      )}
      {checkedIn === true && (
        <Button
          onClick={handleCheckOut}
          variant="contained"
          sx={{
            borderRadius: "50%",
            width: "110px",
            height: "110px",
            textTransform: "none",
            backgroundColor: "darkred",
            "&:hover": {
              backgroundColor: "red",
            },
          }}
        >
          Check Out
        </Button>
      )}
      <Typography>{gpsStatusMsg()}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Work Site</TableCell>
            <TableCell>Check In Time</TableCell>
            <TableCell>Check Out Time</TableCell>
            <TableCell>Duration Worked</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAttendance.map((row) => (
            <TableRow key={row.checkInDateTime}>
              <TableCell>{showDate(row.checkInDateTime)}</TableCell>
              <TableCell>{row.worksite}</TableCell>
              <TableCell>{showTime(row.checkInDateTime)}</TableCell>
              <TableCell>{showTime(row.checkOutDateTime)}</TableCell>
              <TableCell>
                {showTimeDiff(row.checkInDateTime, row.checkOutDateTime)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default WorkerScreen;
