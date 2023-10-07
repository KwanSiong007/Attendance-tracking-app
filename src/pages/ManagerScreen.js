import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import ManagerAttendance from "../components/ManagerAttendance";

const DB_ATTENDANCE_RECORDS_KEY = "action";

function ManagerScreen() {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const recordsRef = ref(database, DB_ATTENDANCE_RECORDS_KEY);

    const unsubscribe = onValue(
      recordsRef,
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
      },
      {
        onlyOnce: false,
      }
    );

    return () => unsubscribe();
  }, []);

  return <ManagerAttendance attendance={attendance} />;
}

export default ManagerScreen;
