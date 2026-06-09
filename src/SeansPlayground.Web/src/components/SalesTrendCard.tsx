import SouthEastOutlinedIcon from "@mui/icons-material/SouthEastOutlined";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { MarketSignal, SalesTrend } from "../types";

export function SalesTrendCard({ trend, signals }: { trend: SalesTrend; signals: MarketSignal[] }) {
  const max = Math.max(...trend.points);
  const min = Math.min(...trend.points);
  const range = max - min || 1;
  const points = trend.points
    .map((point, index) => {
      const x = (index / (trend.points.length - 1)) * 320;
      const y = 96 - ((point - min) / range) * 72;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Box className="salesStack">
      <Card className="salesCard">
        <Box className="salesHeader">
          <Typography fontWeight={800}>{trend.title}</Typography>
          <Box className="salesChange">
            <SouthEastOutlinedIcon fontSize="small" />
            <Typography fontWeight={800}>{trend.change}</Typography>
          </Box>
        </Box>
        <svg className="salesLine" viewBox="0 0 320 110" role="img" aria-label="Sales trend">
          <polyline fill="none" stroke="rgba(255, 255, 255, 0.72)" strokeWidth="4" points={points} />
        </svg>
        <Box className="salesFooter">
          <Box>
            <Typography className="salesNumber">${trend.totalRevenue.toLocaleString()}</Typography>
            <Typography className="mutedText">Total Revenue</Typography>
          </Box>
          <Box>
            <Typography className="salesNumber">{trend.todaySales}</Typography>
            <Typography className="mutedText">Today Sales</Typography>
          </Box>
        </Box>
      </Card>
      <Card className="signalCard">
        {signals.map((signal) => (
          <Box className="signalItem" key={signal.name}>
            <Typography className="signalName">{signal.name}</Typography>
            <Typography className="signalValue" style={{ color: signal.accent }}>
              {signal.change.toFixed(2)}
            </Typography>
          </Box>
        ))}
      </Card>
    </Box>
  );
}

