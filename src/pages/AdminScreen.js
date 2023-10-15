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
  CircularProgress,
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

  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
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
    setLoading(true);

    for (const [userId, newRole] of Object.entries(userRoles)) {
      if (newRole) {
        const profilesRef = ref(database, DB_KEY.PROFILES);
        const q = query(profilesRef, orderByChild("userId"), equalTo(userId));
        const snapshot = await get(q);

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const userKey = childSnapshot.key;
            const userRef = ref(database, `${DB_KEY.PROFILES}/${userKey}`);
            update(userRef, { role: newRole });
          });
        } else {
          console.error(`No user found with userId: ${userId}`);
        }
      }
    }

    await fetchUsers();
    setLoading(false);
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
      }}
    >
      {process.env.NODE_ENV === "development" && (
        <Button onClick={handleGenerateData} variant="contained">
          Generate dummy check ins
        </Button>
      )}
      <TablePagination
        component="div"
        rowsPerPageOptions={[]}
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
              .map((row, index) => (
                <TableRow
                  key={row.userId}
                  sx={{
                    backgroundColor:
                      index % 2 === 1 ? "transparent" : "action.hover",
                  }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={userRoles[row.userId] || "noChange"}
                      onChange={(e) =>
                        handleRoleChange(row.userId, e.target.value)
                      }
                      sx={{ fontSize: "0.875rem", backgroundColor: "white" }}
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
      {loading ? (
        <CircularProgress />
      ) : (
        <Button
          variant="contained"
          color="primary"
          disabled={Object.values(userRoles).every(
            (role) => role === undefined
          )}
          onClick={handleSaveChanges}
        >
          Update Roles
        </Button>
      )}
    </Box>
  );
}

export default AdminScreen;
