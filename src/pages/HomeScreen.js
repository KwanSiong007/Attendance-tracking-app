import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { reAuth, logOut } from "../api/authentication";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { database } from "../firebase";

import { useAuth } from "../contexts/AuthContext";
import WorkerScreen from "./WorkerScreen";
import ManagerScreen from "./ManagerScreen";
import AdminScreen from "./AdminScreen";
import DB_KEY from "../constants/dbKey";
import ROLE from "../constants/role";

const theme = createTheme({
  breakpoints: {
    values: {
      ...createTheme().breakpoints.values,
      mobile: 480,
    },
  },
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({ fontSize: theme.typography.body2.fontSize }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "6px 10px",
        },
      },
    },
  },
});

function HomeScreen() {
  const { user, setUser, loadingAuth } = useAuth();
  const [role, setRole] = useState("");

  useEffect(() => {
    const checkIfLoggedIn = (user) => {
      if (user) {
        setUser(user);
      }
    };

    reAuth(checkIfLoggedIn);
  }, [setUser]);

  useEffect(() => {
    const fetchRole = async () => {
      const profilesRef = ref(database, DB_KEY.PROFILES);
      const q = query(profilesRef, orderByChild("userId"), equalTo(user.uid));
      const snapshot = await get(q);

      snapshot.forEach((childSnapshot) => {
        const profile = childSnapshot.val();
        setRole(profile.role);
      });
    };

    if (user) {
      fetchRole();
    }
  }, [user]);

  const handleSignOut = async () => {
    await logOut();
    setUser(null);
    setRole("");
  };

  if (loadingAuth) {
    return <CircularProgress sx={{ mt: 5 }} />;
  } else if (user) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
          gap: 2,
        }}
      >
        <Typography variant="h4">Welcome, {user.displayName}!</Typography>
        <ThemeProvider theme={theme}>
          {role === ROLE.WORKER && <WorkerScreen workerId={user.uid} />}
          {role === ROLE.MANAGER && <ManagerScreen />}
          {role === ROLE.ADMIN && <AdminScreen />}
        </ThemeProvider>
        <Button onClick={handleSignOut} variant="outlined" sx={{ mb: 4 }}>
          Sign Out
        </Button>
      </Box>
    );
  } else {
    return <Navigate to="/log-in" replace />;
  }
}

export default HomeScreen;
