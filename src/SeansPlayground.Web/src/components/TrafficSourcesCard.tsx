import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { TrafficSource } from "../types";

export function TrafficSourcesCard({ sources }: { sources: TrafficSource[] }) {
  return (
    <Card className="panelCard">
      <CardHeader title="Traffic Sources" titleTypographyProps={{ fontWeight: 800, fontSize: 18 }} />
      <Divider />
      <Box className="trafficList">
        {sources.map((source) => (
          <Box className="trafficItem" key={source.name}>
            <Box className="trafficLabelRow">
              <Typography>{source.name}</Typography>
              <Typography>{source.percentage}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={source.percentage}
              sx={{
                height: 4,
                backgroundColor: "rgba(91, 26, 142, 0.16)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: source.accent
                }
              }}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
}
