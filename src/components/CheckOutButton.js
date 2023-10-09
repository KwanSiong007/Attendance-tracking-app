import { Button } from "@mui/material";

function CheckOutButton({ handleCheckOut }) {
  return (
    <Button
      onClick={handleCheckOut}
      variant="contained"
      sx={{
        borderRadius: "50%",
        width: "160px",
        height: "160px",
        fontSize: "h5.fontSize",
        lineHeight: "1.2",
        textTransform: "none",
        backgroundColor: "darkred",
        "&:hover": {
          backgroundColor: "red",
        },
      }}
    >
      Check Out
    </Button>
  );
}

export default CheckOutButton;
