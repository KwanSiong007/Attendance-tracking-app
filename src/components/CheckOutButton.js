import React, { useRef } from "react";
import { Button } from "@mui/material";

const HOLD_DURATION = 1000; // in milliseconds

function CheckOutButton({ handleCheckOut }) {
  const timeoutRef = useRef(null);

  const handleMouseDown = () => {
    timeoutRef.current = setTimeout(() => {
      handleCheckOut();
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
        backgroundColor: "darkred",
        "&:hover": {
          backgroundColor: "red",
        },
      }}
    >
      Hold to Check Out
    </Button>
  );
}

export default CheckOutButton;
