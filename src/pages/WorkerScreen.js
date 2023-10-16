import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import {
  ref,
  push,
  set,
  update,
  get,
  query,
  orderByChild,
  equalTo,
  onValue,
} from "firebase/database";
import { database } from "../firebase";

import WorkerAttendance from "../components/WorkerAttendance";
import WorkerButton from "../components/WorkerButton";
import { showCurrDate, buildKey } from "../utils";
import DB_KEY from "../constants/dbKey";
import WORKER_BUTTON_TYPE from "../constants/workerButtonType";

const ATTENDANCE_STATUS = {
  LOADING: "loading",
  CHECKED_IN: "checkedIn",
  CHECKED_OUT: "checkedOut",
  CHECKING_IN: "checkingIn",
  CHECKING_OUT: "checkingOut",
};

const GPS_STATUS = {
  OFF: "off",
  REQUESTING: "requesting",
  ON: "on",
  NOT_SUPPORTED: "notSupported",
  DENIED: "denied",
  ERROR: "error",
};

function WorkerScreen({ workerId }) {
  const [nowLoaded, setNowLoaded] = useState(null);
  const [currDate, setCurrDate] = useState("");

  const [worksites, setWorksites] = useState([]);

  const [attendance, setAttendance] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(
    ATTENDANCE_STATUS.LOADING
  );
  const [checkedInSite, setCheckedInSite] = useState(null);
  const [recordId, setRecordId] = useState(null);

  const [gpsStatus, setGpsStatus] = useState(GPS_STATUS.OFF);
  const [gpsSite, setGpsSite] = useState(null);

  useEffect(() => {
    const fetchWorksites = async () => {
      const worksitesRef = ref(database, DB_KEY.WORKSITES);
      const snapshot = await get(worksitesRef);
      let fetchedWorksites = [];
      snapshot.forEach((childSnapshot) => {
        const row = childSnapshot.val();
        fetchedWorksites.push({
          name: row.name,
          coordinates: row.coordinates,
        });
      });
      setWorksites(fetchedWorksites);
    };
    fetchWorksites();
  }, []);

  useEffect(() => {
    const nowLoaded = new Date();
    setNowLoaded(nowLoaded);
    const searchKey = buildKey(workerId, nowLoaded);
    setCurrDate(showCurrDate(nowLoaded));
    const recordsRef = ref(database, DB_KEY.CHECK_INS);
    const q = query(recordsRef, orderByChild("checkInKey"), equalTo(searchKey));

    const unsubscribe = onValue(
      q,
      (snapshot) => {
        let attendance = [];
        let attendanceStatus = ATTENDANCE_STATUS.CHECKED_OUT;
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
            attendanceStatus = ATTENDANCE_STATUS.CHECKED_IN;
            siteName = row.worksite;
            recordId = childSnapshot.key;
          }
        });

        const sortedAttendance = [...attendance].sort(
          (a, b) =>
            Date.parse(b.checkInDateTime) - Date.parse(a.checkInDateTime)
        );

        setAttendance(sortedAttendance);
        setAttendanceStatus(attendanceStatus);
        setCheckedInSite(siteName);
        setRecordId(recordId);
      },
      {
        onlyOnce: false,
      }
    );

    return () => unsubscribe();
  }, [workerId]);

  const checkLocation = (lng, lat) => {
    const userPoint = point([lng, lat]);

    for (let site of worksites) {
      const siteArea = {
        type: "Polygon",
        coordinates: [site.coordinates],
      };

      if (booleanPointInPolygon(userPoint, siteArea)) {
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
          const { longitude, latitude } = position.coords;
          const site = checkLocation(longitude, latitude);
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
    const recordsRef = ref(database, DB_KEY.CHECK_INS);
    const newRecordRef = push(recordsRef);

    setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_IN);
    setRecordId(newRecordRef.key);
    set(newRecordRef, {
      userId: workerId,
      checkInDateTime: new Date().toISOString(),
      checkInKey: searchKey,
      worksite: site.name,
    });
  };

  const handleCheckIn = async () => {
    setAttendanceStatus(ATTENDANCE_STATUS.CHECKING_IN);
    try {
      const site = await locateWorker();
      if (site) {
        writeCheckIn(site);
      } else {
        setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_OUT);
      }
    } catch (error) {
      console.error(`Location retrieval failed: ${error.message}`);
      setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_OUT);
    }
  };

  const writeCheckOut = () => {
    const recordRef = ref(database, `${DB_KEY.CHECK_INS}/${recordId}`);
    setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_OUT);
    setRecordId(null);
    update(recordRef, {
      checkOutDateTime: new Date().toISOString(),
    });
  };

  const handleCheckOut = async () => {
    setAttendanceStatus(ATTENDANCE_STATUS.CHECKING_OUT);
    try {
      const site = await locateWorker();
      if (site?.name === checkedInSite) {
        writeCheckOut();
      } else {
        setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_IN);
      }
    } catch (error) {
      console.error(`Location retrieval failed: ${error.message}`);
      setAttendanceStatus(ATTENDANCE_STATUS.CHECKED_IN);
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
    switch (attendanceStatus) {
      case ATTENDANCE_STATUS.CHECKED_IN:
        return `Checked in at ${checkedInSite}.`;
      case ATTENDANCE_STATUS.CHECKED_OUT:
        return "Checked out.";
      case ATTENDANCE_STATUS.CHECKING_IN:
        return "Checking in...";
      case ATTENDANCE_STATUS.CHECKING_OUT:
        return "Checking out...";
      default:
        return;
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
        {attendanceStatus !== ATTENDANCE_STATUS.LOADING ? (
          <>
            <Typography>{attendanceMsg()}</Typography>
            {worksites.length &&
            attendanceStatus === ATTENDANCE_STATUS.CHECKED_OUT ? (
              <WorkerButton
                buttonType={WORKER_BUTTON_TYPE.CHECK_IN}
                handleHold={handleCheckIn}
              />
            ) : worksites.length &&
              attendanceStatus === ATTENDANCE_STATUS.CHECKED_IN ? (
              <WorkerButton
                buttonType={WORKER_BUTTON_TYPE.CHECK_OUT}
                handleHold={handleCheckOut}
              />
            ) : (
              <Button
                variant="contained"
                disabled
                sx={{
                  borderRadius: "50%",
                  width: "160px",
                  height: "160px",
                  fontSize: "h5.fontSize",
                  lineHeight: "1.5",
                  textTransform: "none",
                }}
              >
                Loading...
              </Button>
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
