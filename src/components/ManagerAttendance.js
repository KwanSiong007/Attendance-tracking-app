import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { showDate, showTime, showTimeDiff } from "../utils";

function ManagerAttendance({ attendance }) {
  return "Placeholder for attendance table";

  // <Table>
  //   <TableHead>
  //     <TableRow>
  //       <TableCell>Date</TableCell>
  //       <TableCell>Work Site</TableCell>
  //       <TableCell>Check In Time</TableCell>
  //       <TableCell>Check Out Time</TableCell>
  //       <TableCell>Duration Worked</TableCell>
  //     </TableRow>
  //   </TableHead>
  //   <TableBody>
  //     {attendance.map((row) => (
  //       <TableRow key={row.checkInDateTime}>
  //         <TableCell>{showDate(row.checkInDateTime)}</TableCell>
  //         <TableCell>{row.worksite}</TableCell>
  //         <TableCell>{showTime(row.checkInDateTime)}</TableCell>
  //         <TableCell>{showTime(row.checkOutDateTime)}</TableCell>
  //         <TableCell>
  //           {showTimeDiff(row.checkInDateTime, row.checkOutDateTime)}
  //         </TableCell>
  //       </TableRow>
  //     ))}
  //   </TableBody>
  // </Table>
}

export default ManagerAttendance;
