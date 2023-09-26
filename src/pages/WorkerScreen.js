import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { onChildAdded, ref } from "firebase/database";
import { database } from "../firebase";

const DB_LOGGED_IN_USER_KEY = "logged_in_user";

function WorkerScreen() {
  const [loggedInUser, setLoggedInUser] = useState([]);

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

  // Assuming the GPS status and location data will be fetched and stored in state
  const gpsStatus = "off"; // This could be 'off', 'on-site', or 'on-other'
  const siteName = "Site A"; // Name of the site if GPS is 'on-site'

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
