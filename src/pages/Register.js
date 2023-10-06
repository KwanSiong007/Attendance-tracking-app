import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { database, storage } from "../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const DB_PROFILE_KEY = "profile-data";
const STORAGE_PROFILE_KEY = "profile-data/";

function Register() {
  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
    profilePicture: null,
  });
  const [passwordError, setPasswordError] = useState(false);

  const registerUser = async () => {
    try {
      const user = await register(state.email, state.password);

      if (state.profilePicture) {
        const fullStorageRef = storageRef(
          storage,
          STORAGE_PROFILE_KEY + state.profilePicture.name
        );
        await uploadBytes(fullStorageRef, state.profilePicture);
        const url = await getDownloadURL(
          fullStorageRef,
          state.profilePicture.name
        );
        await updateProfile(user, {
          displayName: state.username,
          photoURL: url,
        });
        const profileData = {
          username: state.username,
          email: state.email,
          profilePictureUrl: url,
        };
        console.log("profileData:", profileData);
        const profileRef = ref(database, DB_PROFILE_KEY);
        const newProfileRef = push(profileRef);
        set(newProfileRef, profileData);
      }
      setState({
        email: "",
        password: "",
        username: "",
        profilePicture: null,
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

    if (name === "password" && value.length < 8) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    setState({
      ...state,
      profilePicture: file,
    });
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
          <div>
            <label style={{ display: "block" }}>Profile Picture:</label>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="file-upload"
              type="file"
              onChange={(e) => handleFileUpload(e)}
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="outlined"
                color="primary"
                sx={{
                  mt: 1,
                  height: "35px",
                  width: "115px",
                  display: "inline-block",
                  verticalAlign: "middle",
                  textTransform: "none",
                }}
              >
                Choose File
              </Button>
            </label>
            {/* Display "No file chosen" when no file is selected */}
            {state.profilePicture ? (
              <span>{state.profilePicture.name}</span>
            ) : (
              <span>No file chosen</span>
            )}
          </div>
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
          Go back to <Link to="/">Log In</Link>
        </div>
      </Box>
    </Container>
  );
}

export default Register;
