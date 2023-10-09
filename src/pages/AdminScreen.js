import { push, ref } from "firebase/database";
import { database } from "../firebase";
import { Box, Button } from "@mui/material";

import DB_KEYS from "../constants/dbKeys";

function AdminScreen() {
  function getRandomTime(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }

  function generateAndPushDummyData() {
    const userIds = [
      "QraQMwlSDOconsJCeGloNZowfFN2",
      "SYCE7o6TV4a6HmRmBPsMvCcv0zm1",
      "qIbUtgOWf7Sgtjd8F4tyZ6Lu8V73",
      "gmTxj107fkMcEE5fOaAEv6E0cx03",
      "pRxuCqrJybMy9dAZfBbMeVrJwd52",
      "nnWebmCOGSd4kQGUMJdNzvHp15s2",
      "TO3meGdg9fQGcGewKSXDtz9drqi2",
      "xTIXPEjfHJT8cEQ2SnAd2idwaCE2",
      "j5XD5AZEflhyyqshHo9CQ5UlFnu1",
      "ntaGHGbZbMQYhXzxfEz2pJVpkSl1",
      "4EfPJiYginQbZLIu814P2sKrehu2",
      "inkSeiy27ve5WGxH43rPIKCGCzl2",
    ];
    const worksites = ["Jurong", "Paya Lebar", "Tanjong Pagar", "Woodlands"];
    const startDate = new Date("2023-10-02T00:00:00.000+08:00");
    const endDate = new Date("2023-10-09T00:00:00.000+08:00");

    const recordsRef = ref(database, DB_KEYS.CHECK_INS);

    const allCheckIns = [];

    for (let d = startDate; d < endDate; d.setDate(d.getDate() + 1)) {
      userIds.forEach((userId) => {
        const rand = Math.random() * 100;
        let checkIn, checkOut, worksite;

        // No check in (15%)
        if (rand < 15) return;

        worksite = worksites[Math.floor(Math.random() * worksites.length)];

        if (rand < 85) {
          // One check in (70%)
          checkIn = getRandomTime(
            new Date(d.setHours(6, 0, 0, 0)),
            new Date(d.setHours(8, 0, 0, 0))
          );
          checkOut =
            rand < 70
              ? getRandomTime(
                  new Date(d.setHours(17, 0, 0, 0)),
                  new Date(d.setHours(19, 0, 0, 0))
                )
              : // One check in, no check out (15%)
                null;
        } else {
          // Two check ins (10%)
          checkIn = getRandomTime(
            new Date(d.setHours(6, 0, 0, 0)),
            new Date(d.setHours(8, 0, 0, 0))
          );
          checkOut = getRandomTime(
            new Date(d.setHours(12, 0, 0, 0)),
            new Date(d.setHours(13, 0, 0, 0))
          );
          allCheckIns.push({
            checkInDateTime: checkIn.toISOString(),
            checkOutDateTime: checkOut.toISOString(),
            userId: userId,
            worksite: worksite,
          });
          checkIn = getRandomTime(
            new Date(d.setHours(13, 0, 0, 0)),
            new Date(d.setHours(14, 0, 0, 0))
          );
          checkOut = getRandomTime(
            new Date(d.setHours(17, 0, 0, 0)),
            new Date(d.setHours(19, 0, 0, 0))
          );
        }

        allCheckIns.push({
          checkInDateTime: checkIn.toISOString(),
          checkOutDateTime: checkOut ? checkOut.toISOString() : null,
          userId: userId,
          worksite: worksite,
        });
      });
    }

    allCheckIns.sort(
      (a, b) => new Date(a.checkInDateTime) - new Date(b.checkInDateTime)
    );

    allCheckIns.forEach((checkIn) => {
      push(recordsRef, checkIn);
    });
  }

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
      <Button onClick={generateAndPushDummyData} variant="contained">
        Generate dummy data
      </Button>
    </Box>
  );
}

export default AdminScreen;
