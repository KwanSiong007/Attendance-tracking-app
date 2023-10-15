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
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";

import { generateDummyCheckIns } from "../utils";
import DB_KEY from "../constants/dbKey";
import ROLE from "../constants/role";

const ROWS_PER_PAGE = 10;

function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState({});

  const [page, setPage] = useState(0);

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

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleRoleChange = (userId, newRole) => {
    setUserRoles((prev) => ({
      ...prev,
      [userId]: newRole === "noChange" ? undefined : newRole,
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
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mb: 2,
        // width: "100%",
      }}
    >
      {process.env.NODE_ENV === "development" && (
        <Button onClick={handleGenerateData} variant="contained">
          Generate dummy check ins
        </Button>
      )}
      <TablePagination
        component="div"
        count={users.length}
        rowsPerPage={ROWS_PER_PAGE}
        page={page}
        onPageChange={handleChangePage}
        sx={{ width: "100%" }}
      />
      <TableContainer
        component={Paper}
        sx={{ overflowX: "auto", width: "100%" }}
      >
        <Table size="small" sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              {["Name", "Role", "New Role"].map((headCell) => (
                <TableCell key={headCell} sx={{ fontWeight: "bold" }}>
                  {headCell}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)
              .map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={userRoles[user.userId] || "noChange"}
                      onChange={(e) =>
                        handleRoleChange(user.userId, e.target.value)
                      }
                      sx={{ fontSize: "0.875rem" }}
                    >
                      <MenuItem value="noChange">Select...</MenuItem>
                      <MenuItem value={ROLE.WORKER}>Worker</MenuItem>
                      <MenuItem value={ROLE.MANAGER}>Manager</MenuItem>
                      <MenuItem value={ROLE.ADMIN}>Admin</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        disabled={Object.values(userRoles).every((role) => role === undefined)}
        onClick={handleSaveChanges}
      >
        Update Roles
      </Button>
    </Box>
  );
}

export default AdminScreen;
