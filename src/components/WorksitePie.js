import { ResponsivePie } from "@nivo/pie";
import { BasicTooltip } from "@nivo/tooltip";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { schemeSet2 } from "d3-scale-chromatic";

function CustomTooltip({ datum }) {
  const data = datum.data;
  return (
    <BasicTooltip
      id={data.id}
      value={data.value}
      color={datum.color}
      enableChip
    />
  );
}

function WorksitePie({ workerCount, countsByWorksite }) {
  const countAtWorksite = Object.values(countsByWorksite).reduce(
    (sum, count) => sum + count,
    0
  );

  const sortedCountsByWorksite = Object.fromEntries(
    Object.entries(countsByWorksite).sort((a, b) => b[1] - a[1])
  );

  const countsAllWorkers = {
    ...sortedCountsByWorksite,
    "Not at worksite": workerCount - countAtWorksite,
  };

  const pieData = Object.keys(countsAllWorkers).map((worksite) => ({
    id: worksite,
    label: worksite,
    value: countsAllWorkers[worksite],
  }));

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const pieProps = {
    data: pieData,
    tooltip: CustomTooltip,
    colors: (d) => {
      if (d.id === "Not at worksite") {
        return "gray";
      } else {
        const id = pieData.findIndex((p) => p.id === d.id);
        return schemeSet2[id % schemeSet2.length];
      }
    },
    margin: { top: 25, bottom: 25 },
    innerRadius: 0.5,
    cornerRadius: 5,
    arcLabelsSkipAngle: 10,
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
      arcLabelsTextColor: "#333333",
    });
  }

  return <ResponsivePie {...pieProps} />;
}

export default WorksitePie;
