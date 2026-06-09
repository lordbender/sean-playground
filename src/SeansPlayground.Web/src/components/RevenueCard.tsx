import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { RevenueBreakdown } from "../types";

export function RevenueCard({ revenue }: { revenue: RevenueBreakdown }) {
  const gradient = `conic-gradient(${revenue.channels
    .map((channel, index) => {
      const start = revenue.channels.slice(0, index).reduce((sum, item) => sum + item.percentage, 0);
      const end = start + channel.percentage;
      return `${channel.accent} ${start}% ${end}%`;
    })
    .join(", ")})`;

  return (
    <Card className="panelCard">
      <CardHeader title="Total Revenue" titleTypographyProps={{ fontWeight: 800, fontSize: 18 }} />
      <Divider />
      <Box className="revenueBody">
        <Box className="donut" style={{ background: gradient }} />
        <Box className="legendRow">
          {revenue.channels.map((channel) => (
            <Box className="legendItem" key={channel.name}>
              <span style={{ backgroundColor: channel.accent }} />
              <Typography>{channel.name}</Typography>
            </Box>
          ))}
        </Box>
        <Divider flexItem />
        <Box className="channelGrid">
          {revenue.channels.map((channel) => (
            <Box key={channel.name}>
              <Typography fontWeight={800}>{channel.name}</Typography>
              <Typography className={channel.percentage > 10 ? "positiveText" : "warningText"}>
                {channel.percentage > 10 ? "+" : "-"} {channel.percentage.toFixed(2)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}

