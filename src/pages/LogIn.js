import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { signIn, reAuth, logOut } from "../api/authentication";
import WorkerScreen from "./WorkerScreen";
import ManagerScreen from "./ManagerScreen";
import { push, ref, set } from "firebase/database";
import { database } from "../firebase";

const DB_LOGGED_IN_USER_KEY = "logged_in_user";

function LogIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  //The loading state is used to indicate whether the authentication check is still in progress.
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    email: "",
    password: "",
  });

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
        console.log("user", user);
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

  const signInUser = async () => {
    const user = await signIn(state.email, state.password);

    if (user) {
      setIsLoggedIn(true);
      setState({
        email: "",
        password: "",
      });
    }
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleSignOut = async () => {
    await logOut();
    setIsLoggedIn(false);
    setUser({});
  };

  // when first load the page, the logic in the useEffect above is executed
  // while the app is checking if the user is logged in, we will display a loading screen
  if (loading)
    return (
      <div>
        <br />
        <br />
        <br />
        Loading.....
      </div>
    );

  // if the user is already signed in, display the below page
  if (isLoggedIn) {
    const loggedInUserData = {
      username: user.displayName,
      email: user.email,
      userID: user.uid,
    };
    const loggedInRef = ref(database, DB_LOGGED_IN_USER_KEY);
    const newLoggedInRef = push(loggedInRef);
    set(newLoggedInRef, loggedInUserData);
    console.log("loggedInUserData", loggedInUserData);

    const checkManagerRole = () => {
      if (user.uid === "0HLQ3NGKpCZt0LNlT0vET0so7Ip1") {
        return true;
      } else {
        return false;
      }
    };

    const isManager = checkManagerRole();

    return (
      <div>
        <h1>Welcome back, {user.displayName}!</h1>
        {isManager ? (
          <ManagerScreen />
        ) : (
          <WorkerScreen userData={loggedInUserData} />
        )}
        <div>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
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
          mt: 8,
        }}
      >
        <Typography variant="h5">Company Attendance Tracker</Typography>
        <Box component="form" sx={{ mt: 3 }} noValidate>
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
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={signInUser}
          >
            Log In
          </Button>
        </Box>
        <br />
        <div>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </Box>
    </Container>
  );
}

export default LogIn;
