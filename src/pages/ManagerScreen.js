import React, { useEffect, useState } from "react";
import { onChildAdded, ref } from "firebase/database";
import { database } from "../firebase";
import ManagerAttendance from "../components/ManagerAttendance";

const DB_ATTENDANCE_RECORDS_KEY = "action";

function ManagerScreen() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const recordsListRef = ref(database, DB_ATTENDANCE_RECORDS_KEY);
    //onChildAdded(messagesRef, (data) => {...});: This function sets up a listener for when a new child (like a new message) is added to the specified location in the database (in this case, messagesRef).
    //The (data) => {...} part is a callback function that gets executed whenever a new child is added. It's within this callback that you'll handle what happens when a new message is added.
    onChildAdded(recordsListRef, (data) => {
      //Inside the callback function, we are using the setMessages function,
      //This function takes the previous state of the messages array (retrieved from useState) and appends a new message to it.
      // The new message is an object with two properties: key and val. The key is the unique identifier for the message in the database, and val is the actual content of the message.
      setRecords((prevRecords) => [
        ...prevRecords,
        { key: data.key, val: data.val() },
      ]);
    });
  }, []);

  console.log("records:", records);

  return <ManagerAttendance />;
}

export default ManagerScreen;
