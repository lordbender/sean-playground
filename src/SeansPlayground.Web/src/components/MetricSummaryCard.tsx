import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ThumbUpOffAltOutlinedIcon from "@mui/icons-material/ThumbUpOffAltOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { MetricCard } from "../types";

const icons = {
  paid: PaidOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
  article: ArticleOutlinedIcon,
  thumbsUp: ThumbUpOffAltOutlinedIcon
};

export function MetricSummaryCard({ metric }: { metric: MetricCard }) {
  const Icon = icons[metric.icon];

  return (
    <Card className={`metricCard ${metric.accent}`}>
      <Box className="metricCardBody">
        <Box>
          <Typography className="metricValue">{metric.value}</Typography>
          <Typography className="metricLabel">{metric.label}</Typography>
        </Box>
        <Icon className="metricIcon" />
      </Box>
      <Box className="metricFooter">
        <span>{metric.detail}</span>
        <TrendingUpOutlinedIcon fontSize="small" />
      </Box>
    </Card>
  );
}

