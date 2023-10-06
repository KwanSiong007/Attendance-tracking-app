import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Image from "mui-image";
import { register } from "../api/authentication";
import { updateProfile } from "firebase/auth";
import { push, ref, set } from "firebase/database";
import { database, storage } from "../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { VisuallyHiddenInput } from "../utils";

const DB_PROFILE_KEY = "profile-data";
const STORAGE_PROFILE_KEY = "profile-data/";

function Register() {
  const [state, setState] = useState({
    username: "",
    email: "",
    password: "",
    photo: null,
    photoPreviewURL: null,
  });
  const [passwordError, setPasswordError] = useState(false);

  const registerUser = async () => {
    try {
      const user = await register(state.email, state.password);

      if (state.photo) {
        const fullStorageRef = storageRef(
          storage,
          STORAGE_PROFILE_KEY + state.photo.name
        );
        await uploadBytes(fullStorageRef, state.photo);
        const url = await getDownloadURL(fullStorageRef, state.photo.name);
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
        photo: null,
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
    if (file) {
      const previewURL = URL.createObjectURL(file);

      setState({
        ...state,
        photo: file,
        photoPreviewURL: previewURL,
      });
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
          mt: 5,
          gap: 2,
        }}
      >
        <Typography variant="h5">Company Attendance Tracker</Typography>
        <Box
          component="form"
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
            name="username"
            label="Full Name"
            autoComplete="name"
            autoFocus
            value={state.username}
            onChange={(e) => handleChange(e)}
          />
          <InputLabel htmlFor="file-upload" sx={{ mt: 1 }}>
            Profile Photo
          </InputLabel>
          {state.photo && (
            <Image src={state.photoPreviewURL} width="200px" height="200px" />
          )}
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            color="primary"
            sx={{ textTransform: "none" }}
          >
            Upload Photo
            <VisuallyHiddenInput
              accept="image/*"
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
            />
          </Button>
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
        <Typography>
          Go back to <Link to="/">Log In</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Register;
