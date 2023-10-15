import React, { useEffect, useState } from "react";
import {
  get,
  query,
  orderByChild,
  equalTo,
  push,
  ref,
  update,
} from "firebase/database";
import { database } from "../firebase";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { generateDummyCheckIns } from "../utils";
import DB_KEY from "../constants/dbKey";
import ROLE from "../constants/role";

function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});

  const handleGenerateData = () => {
    const recordsRef = ref(database, DB_KEY.CHECK_INS);
    get(recordsRef).then((snapshot) => {
      if (snapshot.exists()) {
        console.error("checkIns already contains data");
      } else {
        const dummyCheckIns = generateDummyCheckIns();
        dummyCheckIns.forEach((checkIn) => {
          push(recordsRef, checkIn);
        });
      }
    });
  };

  useEffect(() => {
    // Fetch users and their roles from Firebase RTDB
    const fetchUsers = async () => {
      const profilesRef = ref(database, DB_KEY.PROFILES);
      const snapshot = await get(query(profilesRef, orderByChild("userId")));
      let fetchedUsers = [];
      snapshot.forEach((childSnapshot) => {
        fetchedUsers.push({
          userId: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setUserRoles((prev) => ({
      ...prev,
      [userId]: newRole === "No change" ? undefined : newRole,
    }));
  };

  const handleSaveChanges = async () => {
    // Persist changes to Firebase
    for (const [userId, newRole] of Object.entries(userRoles)) {
      if (newRole) {
        // Query to find the key of the user with the matching userId
        const profilesRef = ref(database, DB_KEY.PROFILES);
        const q = query(profilesRef, orderByChild("userId"), equalTo(userId));
        const snapshot = await get(q);

        // Check if user exists
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const userKey = childSnapshot.key;
            // Update the role of the user with the found key
            const userRef = ref(database, `${DB_KEY.PROFILES}/${userKey}`);
            update(userRef, { role: newRole });
          });
        } else {
          console.error(`No user found with userId: ${userId}`);
        }
      }
    }

    // Potentially fetch users again to ensure local state is in sync with DB
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
      {process.env.NODE_ENV === "development" && (
        <Button onClick={handleGenerateData} variant="contained">
          Generate dummy check ins
        </Button>
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Current Role</TableCell>
            <TableCell>New Role</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Select
                  value={userRoles[user.userId] || "No change"}
                  onChange={(e) =>
                    handleRoleChange(user.userId, e.target.value)
                  }
                >
                  <MenuItem value="No change">No change</MenuItem>
                  <MenuItem value={ROLE.WORKER}>Worker</MenuItem>
                  <MenuItem value={ROLE.MANAGER}>Manager</MenuItem>
                  <MenuItem value={ROLE.ADMIN}>Admin</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!userRoles[user.userId]}
                  onClick={handleSaveChanges}
                >
                  Save
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default AdminScreen;
