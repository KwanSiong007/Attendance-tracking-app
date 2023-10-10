import { ResponsivePie } from "@nivo/pie";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function WorksitePie({ pieData }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const pieProps = {
    data: pieData,
    margin: { top: 25, bottom: 25 },
    innerRadius: 0.5,
    cornerRadius: 5,
    colors: { scheme: "set1" },
    theme: {
      labels: {
        text: {
          fontSize: "0.875rem",
        },
      },
      axis: {
        ticks: {
          text: {
            fontSize: "0.875rem",
          },
        },
      },
    },
  };

  if (isSmallScreen) {
    Object.assign(pieProps, { enableArcLinkLabels: false });
  } else {
    Object.assign(pieProps, {
      arcLinkLabelsSkipAngle: 10,
      arcLinkLabelsTextColor: "#333333",
      arcLinkLabelsColor: { from: "color" },
      arcLabelsSkipAngle: 10,
      arcLabelsTextColor: "#333333",
    });
  }

  return <ResponsivePie {...pieProps} />;
}

export default WorksitePie;
