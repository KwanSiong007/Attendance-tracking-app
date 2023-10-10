import React, { useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

import WORKER_BUTTON_TYPES from "../constants/workerButtonTypes";

const HOLD_DURATION = 1000; // in milliseconds

function WorkerButton({ buttonType, handleHold }) {
  const checkInButton = buttonType === WORKER_BUTTON_TYPES.CHECK_IN;
  const [holding, setHolding] = useState(false);

  const handleMouseDown = () => {
    setHolding(true);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime >= HOLD_DURATION) {
        handleHold();
        setHolding(false);
        clearInterval(intervalId);
      }
    }, 50);

    const handleMouseUp = () => {
      setHolding(false);
      clearInterval(intervalId);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseleave", handleMouseUp);
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseleave", handleMouseUp);
  };

  return (
    <>
      <Box position="relative">
        <Button
          onMouseDown={handleMouseDown}
          variant="contained"
          sx={{
            borderRadius: "50%",
            width: "160px",
            height: "160px",
            fontSize: "h5.fontSize",
            lineHeight: "1.5",
            textTransform: "none",
            backgroundColor: checkInButton ? "darkgreen" : "darkred",
            "&:hover": {
              backgroundColor: checkInButton ? "green" : "red",
            },
            opacity: holding ? 0.2 : 1,
            transition: "opacity 1s",
          }}
        >
          {!holding && `Hold to ${checkInButton ? "Check In" : "Check Out"}`}
        </Button>
        {holding && (
          <CircularProgress
            size={160}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-80px",
              marginLeft: "-80px",
              zIndex: 1,
              color: checkInButton ? "green" : "red",
            }}
          />
        )}
      </Box>
    </>
  );
}

export default WorkerButton;
