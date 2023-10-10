import React, { useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";

import WORKER_BUTTON_TYPE from "../constants/workerButtonType";

const HOLD_DURATION = 1000; // in milliseconds

function WorkerButton({ buttonType, handleHold }) {
  const checkInButton = buttonType === WORKER_BUTTON_TYPE.CHECK_IN;
  const [holding, setHolding] = useState(false);

  const handleStart = () => {
    setHolding(true);
    document.body.classList.add("noSelect");

    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime >= HOLD_DURATION) {
        handleHold();
        setHolding(false);
        clearInterval(intervalId);
      }
    }, 50);

    const handleEnd = () => {
      setHolding(false);
      document.body.classList.remove("noSelect");

      clearInterval(intervalId);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("mouseleave", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };

    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("mouseleave", handleEnd);
    window.addEventListener("touchend", handleEnd);
  };

  return (
    <>
      <Box position="relative">
        <Button
          onMouseDown={handleStart}
          onTouchStart={handleStart}
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
              color: checkInButton ? "green" : "red",
            }}
          />
        )}
      </Box>
    </>
  );
}

export default WorkerButton;
