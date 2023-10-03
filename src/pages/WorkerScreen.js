import React, { useState } from "react";
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
import {
  push,
  ref,
  set,
  query,
  orderByChild,
  get,
  update,
  startAt,
  endAt,
} from "firebase/database";
import { database } from "../firebase";

const DB_ATTENDANCE_RECORDS_KEY = "action";

function WorkerScreen({ userData }) {
  const [gpsStatus, setGpsStatus] = useState("off");
  const [siteName, setSiteName] = useState(null);

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

  const writeData = async (site) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Singapore",
    });
    //compoundKey used to uniquely identify attendance records for a specific user, at a specific worksite, on a specific date.
    const compoundKey = `${userData.username}_${site.name}_${currentDate}`;

    //This line creates a reference (recordsRef) to a location in the Firebase Realtime Database specified by the DB_ATTENDANCE_RECORDS_KEY. This is where attendance records will be stored.
    const recordsRef = ref(database, DB_ATTENDANCE_RECORDS_KEY);
    //we set up a query (queryRef) to check if an attendance record for the same user, worksite, and date already exists.
    //We use the orderByChild("compoundKey") to order the records by the compoundKey field and then use startAt and endAt to find records that match the compoundKey.
    const queryRef = query(
      recordsRef,
      orderByChild("compoundKey"),
      startAt(compoundKey),
      endAt(compoundKey)
    );
    //This line executes the query and retrieves any existing attendance records that match the compoundKey.
    //The results are stored in the existingRecords variable.
    const existingRecords = await get(queryRef);
    //it checks if there are no existing records for the same user, worksite, and date.
    if (existingRecords.size === 0) {
      //If no existing records are found, this line generates a new reference with a unique key within the recordsRef, which is essentially creating a new attendance record.
      const newRecordsRef = push(recordsRef);
      //store the new attendance record data in the database
      await set(newRecordsRef, {
        compoundKey: compoundKey, // Store the compound key for querying
        username: userData.username,
        worksite: site.name,
        checkInDateTime: new Date().toISOString(),
      });
    } else {
      //If existing records are found, this code iterates through them using a forEach loop.
      existingRecords.forEach((record) => {
        //Inside the loop, a reference (recordRef) is created to the specific attendance record that needs to be updated.
        const recordRef = ref(
          database,
          `${DB_ATTENDANCE_RECORDS_KEY}/${record.key}`
        );
        //The update function is used to add or update the checkOutDateTime field of the existing attendance record to mark the check-out time.
        update(recordRef, {
          checkOutDateTime: new Date().toISOString(),
        });
      });
    }
  };

  const checkSite = (lat, lng) => {
    const userPoint = point([lat, lng]);
    for (let site of sites) {
      const sitePoint = point([site.coordinates.lat, site.coordinates.lng]);
      const distance = findDistance(userPoint, sitePoint);
      console.log(`Distance of ${distance} km from ${site.name}.`);
      if (distance < site.radius) {
        writeData(site);
        setGpsStatus("on-site");
        setSiteName(site.name);
        return;
      }
    }
    setGpsStatus("on-elsewhere");
    setSiteName(null);
  };

  const handleCheckIn = () => {
    if (!("geolocation" in navigator)) {
      setGpsStatus("error-not-supported");
      return;
    }

    navigator.permissions
      .query({ name: "geolocation" })
      .then(function (result) {
        if (result.state === "denied") {
          console.error("User must manually grant permissions.");
          setGpsStatus("error-denied");
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGpsStatus("detecting");
            const { latitude, longitude } = position.coords;
            console.log(`Location at lat: ${latitude}, lng: ${longitude}.`);
            checkSite(latitude, longitude);
          },
          (error) => {
            console.error(error);
            if (error.code === 1) {
              setGpsStatus("error-denied");
            } else {
              setGpsStatus("error");
            }
          },
          { enableHighAccuracy: true }
        );
      });
  };

  const checkIns = [
    { location: "Site A", checkInTime: "08:00 AM", checkOutTime: "05:00 PM" },
    // ...other check-ins
  ];

  const statusMessages = {
    detecting: "Detecting your location. Please wait.",
    "on-site": `Checked in/out at ${siteName}.`,
    "on-elsewhere":
      "You're not at any work site. If you're at a work site, please contact support.",
    "error-denied":
      "Please allow access to GPS so we can tell whether you're at a work site.",
    error: "GPS error. Please contact support.",
    "error-not-supported":
      "GPS not supported. Please use a compatible browser.",
  };

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
      <Button
        onClick={handleCheckIn}
        variant="contained"
        sx={{
          borderRadius: "50%",
          width: "100px",
          height: "100px",
          textTransform: "none",
        }}
      >
        Check In
      </Button>
      {gpsStatus !== "off" && (
        <Typography>{statusMessages[gpsStatus]}</Typography>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Location</TableCell>
            <TableCell>Check-in Time</TableCell>
            <TableCell>Check-out Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkIns.map((checkIn, index) => (
            <TableRow key={index}>
              <TableCell>{checkIn.location}</TableCell>
              <TableCell>{checkIn.checkInTime}</TableCell>
              <TableCell>{checkIn.checkOutTime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default WorkerScreen;
