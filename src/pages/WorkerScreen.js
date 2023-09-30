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
import { onChildAdded, ref } from "firebase/database";
import { database } from "../firebase";

const DB_LOGGED_IN_USER_KEY = "logged_in_user";

function WorkerScreen() {
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [gpsStatus, setGpsStatus] = useState("off");
  const [siteName, setSiteName] = useState(null);

  useEffect(() => {
    const loggedInUserRef = ref(database, DB_LOGGED_IN_USER_KEY);
    onChildAdded(loggedInUserRef, (data) => {
      setLoggedInUser((prevData) => [
        ...prevData,
        { key: data.key, val: data.val() },
      ]);
    });
  }, []);

  console.log("loggedInUser:", loggedInUser);

  const handleGetLocation = () => {
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
      // ...other sites
    ];

    const checkSite = (lat, lng) => {
      const userPoint = point([lat, lng]);
      for (let site of sites) {
        const sitePoint = point([site.coordinates.lat, site.coordinates.lng]);
        const distance = findDistance(userPoint, sitePoint);
        console.log(`Distance of ${distance} km from ${site.name}`);
        if (distance < site.radius) {
          setSiteName(site.name);
          setGpsStatus("on-site");
          return;
        }
      }
      setGpsStatus("on-elsewhere");
      setSiteName(null);
    };

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(
            `Position detected at lat: ${latitude}, lng: ${longitude}`
          );
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
    } else {
      setGpsStatus("error-not-supported");
    }
  };

  const checkIns = [
    { location: "Site A", checkInTime: "08:00 AM", checkOutTime: "05:00 PM" },
    // ...other check-ins
  ];

  const statusMessages = {
    "on-site": `You're at ${siteName}. Ready to check in/out.`,
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
      {gpsStatus !== "off" && (
        <Typography>{statusMessages[gpsStatus]}</Typography>
      )}
      {!["on-site", "on-elsewhere"].includes(gpsStatus) && (
        <Button
          onClick={handleGetLocation}
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          Get Location
        </Button>
      )}
      <Button
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
