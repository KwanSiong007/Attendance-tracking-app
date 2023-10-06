import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { styled } from "@mui/material/styles";

const extractDaySGT = (date) => {
  return format(utcToZonedTime(date, "Asia/Singapore"), "yyyy-MM-dd");
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export { extractDaySGT, VisuallyHiddenInput };
