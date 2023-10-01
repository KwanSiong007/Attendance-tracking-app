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
import { push, ref, set } from "firebase/database";
import { database } from "../firebase";

const DB_ATTENDANCE_RECORDS_KEY = "attendance-records";

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

  const writeDataTo = (site) => {
    // This data can be written to database
    console.log(`User name: ${userData.username}`);
    console.log(`Site name: ${site.name}`);
    const dateInSG = new Date().toLocaleDateString("en-US", {
      timeZone: "Asia/Singapore",
    });
    console.log(`Current date: ${dateInSG}`);
    const currentTimeInSG = new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Singapore",
      timeStyle: "short",
    });
    console.log("currentTimeInSG:", currentTimeInSG);

    // Not sure if these are needed
    console.log(`User email: ${userData.email}`);
    console.log(`User ID: ${userData.userID}`);
    const nowInSG = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Singapore",
    });
    console.log(`Current datetime: ${nowInSG}`);
  };

  const writeData = async (site) => {
    const recordsRef = ref(database, DB_ATTENDANCE_RECORDS_KEY);
    const newRecordsRef = push(recordsRef);
    // Get the unique key of the new attendance records
    const newRecordsKey = newRecordsRef.key;
    console.log("newRecordsKey:", newRecordsKey);
    //The `set` function sets the value of the new reference (in this case, newRecordsKey) to a specific value.
    await set(newRecordsRef, {
      username: userData.username,
      worksite: site.name,
      currentDate: new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Singapore",
      }),
      clockInTime: new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Singapore",
        timeStyle: "short",
      }),
    });
  };

  const checkSite = (lat, lng) => {
    const userPoint = point([lat, lng]);
    for (let site of sites) {
      const sitePoint = point([site.coordinates.lat, site.coordinates.lng]);
      const distance = findDistance(userPoint, sitePoint);
      console.log(`Distance of ${distance} km from ${site.name}.`);
      if (distance < site.radius) {
        writeDataTo(site);
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
