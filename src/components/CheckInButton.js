import { Button } from "@mui/material";

function CheckInButton({ handleCheckIn }) {
  return (
    <Button
      onClick={handleCheckIn}
      variant="contained"
      sx={{
        borderRadius: "50%",
        width: "160px",
        height: "160px",
        fontSize: "h5.fontSize",
        lineHeight: "1.2",
        textTransform: "none",
        backgroundColor: "darkgreen",
        "&:hover": {
          backgroundColor: "green",
        },
      }}
    >
      Check In
    </Button>
  );
}

export default CheckInButton;
