import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { register } from "../api/authentication";
import { updateProfile } from "firebase/auth";
import { push, ref, set } from "firebase/database";
import { database } from "../firebase"; // Import Firebase database instance

const DB_PROFILE_KEY = "profile-data";

function Register() {
  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [passwordError, setPasswordError] = useState(false);

  const registerUser = async () => {
    try {
      const user = await register(state.email, state.password);

      // Update the user's profile with the provided username
      await updateProfile(user, {
        displayName: state.username,
      });

      // UPDATE profileData, which are username & email to the realtime database.
      const profileData = {
        username: state.username,
        email: state.email,
      };
      console.log("profileData:", profileData);
      const profileRef = ref(database, DB_PROFILE_KEY);

      // Create a new profile entry in the database
      const newProfileRef = push(profileRef);
      // Set the profile data
      set(newProfileRef, profileData);

      setState({
        email: "",
        password: "",
        username: "",
      });
      console.log("User registered:", user);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Error at register: ${errorCode} ${errorMessage}`);
    }
  };

  //The handleChange function is called whenever the password field changes, and it checks if the password length is less than 8 characters.
  //If it's less than 8 characters, it sets passwordError to true, which triggers an error message below the password field.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });

    // Check for minimum password length
    if (name === "password" && value.length < 8) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  //The error prop in the password TextField is set to passwordError, which will make the field turn red and display the error message when passwordError is true.
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
            name="username"
            label="Full Name"
            autoComplete="name"
            autoFocus
            value={state.username}
            onChange={(e) => handleChange(e)}
          />
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
            autoComplete="new-password"
            onChange={(e) => handleChange(e)}
            error={passwordError}
            helperText={
              passwordError ? "Password must be at least 8 characters" : ""
            }
            value={state.password}
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={registerUser}
            disabled={passwordError}
          >
            Register
          </Button>
        </Box>
        <br />
        <div>
          Go back to Sign in page: <a href="/">Sign in</a>
        </div>
      </Box>
    </Container>
  );
}

export default Register;
