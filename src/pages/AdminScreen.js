import { useEffect, useState } from "react";
import { ref, push, update, get } from "firebase/database";
import { database } from "../firebase";
import {
  Box,
  Button,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import WorksiteConfig from "../components/WorksiteConfig";
import { generateDummyCheckIns } from "../utils";
import DB_KEY from "../constants/dbKey";
import ROLE from "../constants/role";

const ROWS_PER_PAGE = 10;

function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down("mobile"));

  const handleTabChange = (e, newTab) => {
    setTab(newTab);
  };

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
    const snapshot = await get(profilesRef);

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

  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);

    try {
      const profileRef = ref(database, `${DB_KEY.PROFILES}/${userId}`);
      await update(profileRef, { role: newRole });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoading(false);
    }
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
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant={isMobileScreen ? "fullWidth" : "standard"}
      >
        {["Roles", "Worksites"].map((label, index) => (
          <Tab label={label} key={index} />
        ))}
      </Tabs>
      {tab === 0 && (
        <>
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
                  {["Name", "Role"].map((headCell) => (
                    <TableCell key={headCell} sx={{ fontWeight: "bold" }}>
                      {headCell}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users
                  .slice(
                    page * ROWS_PER_PAGE,
                    page * ROWS_PER_PAGE + ROWS_PER_PAGE
                  )
                  .map((row, index) => (
                    <TableRow
                      key={row.userId}
                      sx={{
                        backgroundColor:
                          index % 2 === 1 ? "transparent" : "action.hover",
                      }}
                    >
                      <TableCell>
                        <ListItemText
                          primary={
                            <Typography variant="body2">{row.name}</Typography>
                          }
                          secondary={row.email}
                        />
                      </TableCell>
                      <TableCell sx={{ paddingLeft: 0 }}>
                        <Select
                          size="small"
                          value={row.role}
                          onChange={(e) =>
                            handleRoleChange(row.userId, e.target.value)
                          }
                          disabled={loading}
                          sx={{
                            fontSize: "0.875rem",
                            backgroundColor: "white",
                            width: "100%",
                          }}
                        >
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
        </>
      )}

      {tab === 1 && <WorksiteConfig />}
    </Box>
  );
}

export default AdminScreen;
