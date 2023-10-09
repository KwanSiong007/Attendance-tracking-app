import { ResponsivePie } from "@nivo/pie";

function WorksitePie({ pieData }) {
  return (
    <ResponsivePie
      data={pieData}
      margin={{ top: 25, bottom: 25 }}
      innerRadius={0.5}
      cornerRadius={5}
      colors={{ scheme: "set1" }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor="#333333"
      theme={{
        labels: {
          text: {
            fontSize: "0.875rem", // Adjust font size as needed
          },
        },
        axis: {
          ticks: {
            text: {
              fontSize: "0.875rem", // Adjust font size as needed
            },
          },
        },
      }}
    />
  );
}

export default WorksitePie;
