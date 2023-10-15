import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { signIn, reAuth, logOut } from "../api/authentication";
import {
  push,
  ref,
  set,
  query,
  orderByChild,
  equalTo,
  get,
} from "firebase/database";
import { database } from "../firebase";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);

    const checkIfLoggedIn = (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUser(user);
      }
      setLoading(false);
    };

    reAuth(checkIfLoggedIn);
  }, []);

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

    if (user.uid) {
      fetchRole();
    }
  }, [user]);

  const signInUser = async () => {
    setLoggingIn(true);
    try {
      const user = await signIn(state.email, state.password);

      const logIn = {
        userId: user.uid,
        logInDateTime: new Date().toISOString(),
      };
      const logInsRef = ref(database, DB_KEY.LOG_INS);
      const newLogInRef = push(logInsRef);
      set(newLogInRef, logIn);

      setIsLoggedIn(true);
      setState({
        email: "",
        password: "",
      });
      setLoggingIn(false);
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-login-credentials":
          setError("Incorrect email or password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          console.error(error);
      }
      setLoggingIn(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleSignOut = async () => {
    await logOut();
    setIsLoggedIn(false);
    setUser({});
    setRole("");
    setError("");
  };

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  if (isLoggedIn) {
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
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4,
          gap: 2,
        }}
      >
        <Typography variant="h5">Company Attendance Tracker</Typography>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            signInUser();
          }}
          width="100%"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
          noValidate
        >
          <TextField
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={state.email}
            onChange={(e) => handleChange(e)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={state.password}
            onChange={(e) => handleChange(e)}
          />
          {error && <div style={{ color: "red" }}>{error}</div>}
          {loggingIn ? (
            <CircularProgress />
          ) : (
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Log In
            </Button>
          )}
        </Box>
        <Typography sx={{ mt: 1 }}>
          Need an account? <Link to="/register">Register</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default HomeScreen;
