import { get, push, ref } from "firebase/database";
import { database } from "../firebase";
import { Box, Button } from "@mui/material";

import { generateDummyCheckIns } from "../utils";
import DB_KEY from "../constants/dbKey";

function AdminScreen() {
  const handleGenerate = () => {
    const recordsRef = ref(database, DB_KEY.CHECK_INS);
    get(recordsRef).then((snapshot) => {
      if (snapshot.exists()) {
        console.error("checkIns already contains data");
      } else {
        const dummyCheckIns = generateDummyCheckIns();
        dummyCheckIns.forEach((checkIn) => {
          push(recordsRef, checkIn);
        });
      }
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        mb: 2,
      }}
    >
      {process.env.NODE_ENV === "development" && (
        <Button onClick={handleGenerate} variant="contained">
          Generate dummy check ins
        </Button>
      )}
    </Box>
  );
}

export default AdminScreen;
