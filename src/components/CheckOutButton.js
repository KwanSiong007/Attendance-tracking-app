import React, { useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

const HOLD_DURATION = 1000; // in milliseconds

function CheckOutButton({ handleCheckOut }) {
  const [holding, setHolding] = useState(false);

  const handleMouseDown = () => {
    setHolding(true);
    const startTime = Date.now();

    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime >= HOLD_DURATION) {
        handleCheckOut();
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
      <Typography>{`${holding}`}</Typography>
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
            backgroundColor: "darkred",
            "&:hover": {
              backgroundColor: "red",
            },
            opacity: holding ? 0.2 : 1,
            transition: "opacity 1s",
          }}
        >
          {!holding && "Hold to Check Out"}
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
              color: "red",
            }}
          />
        )}
      </Box>
    </>
  );
}

export default CheckOutButton;
