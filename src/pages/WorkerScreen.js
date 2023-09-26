import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
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

    const sites = [
      {
        name: "Tanjong Pagar MRT",
        coordinates: { lat: 1.276650525561771, lng: 103.845886249542 },
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
      setSiteName(null);
      setGpsStatus("on-other");
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
          setGpsStatus("off");
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  console.log("loggedInUser:", loggedInUser);

  const checkIns = [
    { location: "Site A", checkInTime: "08:00 AM", checkOutTime: "05:00 PM" },
    // ...other check-ins
  ];

  let statusText;
  switch (gpsStatus) {
    case "on-site":
      statusText = `GPS is on. You are at ${siteName}.`;
      break;
    case "on-other":
      statusText = "GPS is on. You are not at any site.";
      break;
    default:
      statusText = "GPS is off.";
  }

  return (
    <>
      <div>{statusText}</div>
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
    </>
  );
}

export default WorkerScreen;
