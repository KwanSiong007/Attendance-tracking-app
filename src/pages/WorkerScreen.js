import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { point } from "@turf/helpers";
import { default as findDistance } from "@turf/distance";
import {
  push,
  ref,
  set,
  onValue,
  query,
  orderByChild,
  equalTo,
  update,
} from "firebase/database";
import { database } from "../firebase";

import WorkerAttendance from "../components/WorkerAttendance";
import CheckInButton from "../components/CheckInButton";
import CheckOutButton from "../components/CheckOutButton";
import { showCurrDate, buildKey } from "../utils";
import DB_KEYS from "../constants/dbKeys";

const GPS_STATUS = {
  OFF: "off",
  REQUESTING: "requesting",
  ON: "on",
  NOT_SUPPORTED: "not-supported",
  DENIED: "denied",
  ERROR: "error",
};

function WorkerScreen({ workerId }) {
  const [nowLoaded, setNowLoaded] = useState(null);
  const [currDate, setCurrDate] = useState("");

  const [attendance, setAttendance] = useState([]);
  const [checkedIn, setCheckedIn] = useState(null);
  const [checkedInSite, setCheckedInSite] = useState(null);
  const [recordId, setRecordId] = useState(null);

  const [gpsStatus, setGpsStatus] = useState(GPS_STATUS.OFF);
  const [gpsSite, setGpsSite] = useState(null);

  useEffect(() => {
    const nowLoaded = new Date();
    setNowLoaded(nowLoaded);
    const searchKey = buildKey(workerId, nowLoaded);
    setCurrDate(showCurrDate(nowLoaded));
    const recordsRef = ref(database, DB_KEYS.CHECK_INS);
    const q = query(recordsRef, orderByChild("checkInKey"), equalTo(searchKey));

    const unsubscribe = onValue(
      q,
      (snapshot) => {
        let attendance = [];
        let checkedIn = false;
        let siteName = null;
        let recordId = null;

        snapshot.forEach((childSnapshot) => {
          const row = childSnapshot.val();
          attendance.push({
            worksite: row.worksite,
            checkInDateTime: row.checkInDateTime,
            checkOutDateTime: row.checkOutDateTime,
          });

          if (!row.checkOutDateTime) {
            checkedIn = true;
            siteName = row.worksite;
            recordId = childSnapshot.key;
          }
        });

        const sortedAttendance = [...attendance].sort(
          (a, b) =>
            Date.parse(b.checkInDateTime) - Date.parse(a.checkInDateTime)
        );

        setAttendance(sortedAttendance);
        setCheckedIn(checkedIn);
        setCheckedInSite(siteName);
        setRecordId(recordId);
      },
      {
        onlyOnce: false,
      }
    );

    return () => unsubscribe();
  }, [workerId]);

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

  const checkLocation = (lat, lng) => {
    const userPoint = point([lat, lng]);
    for (let site of sites) {
      const sitePoint = point([site.coordinates.lat, site.coordinates.lng]);
      const distance = findDistance(userPoint, sitePoint);
      // console.log(`Distance of ${distance} km from ${site.name}.`);
      if (distance < site.radius) {
        setGpsSite(site.name);
        return site;
      }
    }
    setGpsSite(null);
    return null;
  };

  const locateWorker = async () => {
    if (!("geolocation" in navigator)) {
      setGpsStatus(GPS_STATUS.NOT_SUPPORTED);
      throw new Error("Geolocation not supported");
    }

    setGpsStatus(GPS_STATUS.REQUESTING);
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    if (permission.state === "denied") {
      setGpsStatus(GPS_STATUS.DENIED);
      throw new Error("Geolocation permission denied");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsStatus(GPS_STATUS.ON);
          const { latitude, longitude } = position.coords;
          const site = checkLocation(latitude, longitude);
          resolve(site);
        },
        (error) => {
          console.error(error);
          if (error.code === 1) {
            setGpsStatus(GPS_STATUS.DENIED);
          } else {
            setGpsStatus(GPS_STATUS.ERROR);
          }
          reject(new Error("Geolocation error"));
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const writeCheckIn = (site) => {
    const searchKey = buildKey(workerId, new Date());
    const recordsRef = ref(database, DB_KEYS.CHECK_INS);
    const newRecordRef = push(recordsRef);

    setCheckedIn(true);
    setRecordId(newRecordRef.key);
    set(newRecordRef, {
      userId: workerId,
      checkInDateTime: new Date().toISOString(),
      checkInKey: searchKey,
      worksite: site.name,
    });
  };

  const handleCheckIn = async () => {
    try {
      const site = await locateWorker();
      if (site) {
        writeCheckIn(site);
      }
    } catch (error) {
      console.error(`Location retrieval failed: ${error.message}`);
    }
  };

  const writeCheckOut = () => {
    const recordRef = ref(database, `${DB_KEYS.CHECK_INS}/${recordId}`);
    setCheckedIn(false);
    setRecordId(null);
    update(recordRef, {
      checkOutDateTime: new Date().toISOString(),
    });
  };

  const handleCheckOut = async () => {
    try {
      const site = await locateWorker();
      if (site?.name === checkedInSite) {
        writeCheckOut();
      }
    } catch (error) {
      console.error(`Location retrieval failed: ${error.message}`);
    }
  };

  const gpsStatusMsg = () => {
    switch (gpsStatus) {
      case GPS_STATUS.REQUESTING:
        return "Requesting location access.";
      case GPS_STATUS.ON:
        if (!gpsSite) {
          return "Your current location is not at a work site.";
        } else if (checkedInSite && gpsSite !== checkedInSite) {
          return `Your current location is ${gpsSite}. You must check out from ${checkedInSite}.`;
        } else {
          return `Your current location is ${gpsSite}.`;
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
        {checkedIn !== null ? (
          <>
            <Typography>{attendanceMsg()}</Typography>
            {checkedIn === false && (
              <CheckInButton handleCheckIn={handleCheckIn} />
            )}
            {checkedIn === true && (
              <CheckOutButton handleCheckOut={handleCheckOut} />
            )}
            <Typography>{gpsStatusMsg()}</Typography>
            <Typography sx={{ alignSelf: "flex-start" }}>
              Showing your check ins today ({currDate}):
            </Typography>
            <WorkerAttendance attendance={attendance} nowLoaded={nowLoaded} />
          </>
        ) : (
          <CircularProgress />
        )}
      </Box>
    </Container>
  );
}

export default WorkerScreen;
