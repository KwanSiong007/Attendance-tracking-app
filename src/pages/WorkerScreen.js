import React, { useEffect, useState } from "react";
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

  return <div>WorkerScreen</div>;
}

export default WorkerScreen;
