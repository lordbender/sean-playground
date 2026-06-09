import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function BrandMark() {
  return (
    <Box className="brandMark">
      <Box className="brandIcon" aria-hidden>
        <span />
        <span />
        <span />
      </Box>
      <Typography variant="h6" component="div" fontWeight={800}>
        Playground
      </Typography>
    </Box>
  );
}

