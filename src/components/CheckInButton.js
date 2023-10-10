import React, { useRef } from "react";
import { Button } from "@mui/material";

const HOLD_DURATION = 1000; // in milliseconds

function CheckInButton({ handleCheckIn }) {
  const timeoutRef = useRef(null);

  const handleMouseDown = () => {
    timeoutRef.current = setTimeout(() => {
      handleCheckIn();
    }, HOLD_DURATION);
  };

  const handleMouseUp = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <Button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      variant="contained"
      sx={{
        borderRadius: "50%",
        width: "160px",
        height: "160px",
        fontSize: "h5.fontSize",
        lineHeight: "1.5",
        textTransform: "none",
        backgroundColor: "darkgreen",
        "&:hover": {
          backgroundColor: "green",
        },
      }}
    >
      Hold to Check In
    </Button>
  );
}

export default CheckInButton;
