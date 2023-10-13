import { ResponsivePie } from "@nivo/pie";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { schemeSet2 } from "d3-scale-chromatic";

function WorksitePie({ pieData }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const pieProps = {
    data: pieData,
    colors: (d) => {
      if (d.id === "Not at worksite") {
        return "grey";
      } else {
        const id = pieData.findIndex((p) => p.id === d.id);
        return schemeSet2[id % schemeSet2.length];
      }
    },
    margin: { top: 25, bottom: 25 },
    innerRadius: 0.5,
    cornerRadius: 5,
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
