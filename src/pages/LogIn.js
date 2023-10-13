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
import DB_KEY from "../constants/dbKey";
import ROLE from "../constants/role";
import AdminScreen from "./AdminScreen";

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

function LogIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [role, setRole] = useState("");
  //The loading state is used to indicate whether the authentication check is still in progress.
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    //This declares a function named checkIfLoggedIn which takes a user as an argument.
    //It's used to check if a user is logged in and updates the component's state accordingly.
    const checkIfLoggedIn = (user) => {
      //If there's a user, it means the user is logged in, so it does the following:
      //Sets the isLoggedIn state to true, indicating that the user is logged in.
      //Sets the loading state to false, indicating that the loading process is complete.
      //Sets the user state with the user data.
      if (user) {
        setIsLoggedIn(true);
        setLoading(false);
        // User is signed in, see docs for a list of available properties
        setUser(user);
        // console.log("user", user);
      }
      //If there's no user, it means the user is not logged in or signed out, so it does the following:
      //Sets the loading state to false, indicating that the loading process is complete.
      else {
        setLoading(false);
        // User is signed out
        return null;
      }
    };

    //This sets the loading state to true initially, indicating that the component is in the process of loading.
    setLoading(true);
    //Passes the checkIfLoggedIn function as a callback to reAuth.
    //The purpose of this is to listen for changes in the user's authentication state, and when it changes, the checkIfLoggedIn function will be called with the user data (if the user is logged in) or null (if the user is not logged in).
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
    const user = await signIn(state.email, state.password);

    if (user) {
      const logIn = {
        userId: user.uid,
        logInDateTime: new Date().toISOString(),
      };
      const logInsRef = ref(database, DB_KEY.LOG_INS);
      const newLogInRef = push(logInsRef);
      set(newLogInRef, logIn);
      // console.log("logIn", logIn);

      setIsLoggedIn(true);
      setState({
        email: "",
        password: "",
      });
    } else {
      setError(
        "The email or password you entered is incorrect. Please try again."
      );
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
  };

  // when first load the page, the logic in the useEffect above is executed
  // while the app is checking if the user is logged in, we will display a loading screen
  if (loading) return <CircularProgress sx={{ mt: 5 }} />;

  // if the user is already signed in, display the below page
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

  // if the user is NOT signed in, make them sign in
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Log In
          </Button>
        </Box>
        <Typography sx={{ mt: 1 }}>
          Need an account? <Link to="/register">Register</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default LogIn;
