import React from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const StatCard = ({ title, value, icon, color }) => {
  // make sure we can control icon style
  const renderedIcon = icon
    ? React.cloneElement(icon, {
        sx: { fontSize: 24, color: "#fff" }   // bright white icon
      })
    : null;

  return (
    <Card
      sx={{
        background: color,
        color: "#fff",
        borderRadius: "18px",
        height: 120,
        display: "flex",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "all .25s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 18px rgba(0,0,0,0.22)"
        }
      }}
    >
      <CardContent sx={{ width: "100%", position: "relative", px: 3, py: 2 }}>
        {/* text */}
        <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </Typography>

        <Typography sx={{ fontSize: 14, mt: 1, opacity: 0.9 }}>
          {title}
        </Typography>

        {/* icon bubble */}
        {renderedIcon && (
          <Box
            sx={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              width: 42,
              height: 42,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.2)", // soft bubble
              backdropFilter: "blur(2px)"
            }}
          >
            {renderedIcon}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.element,
  color: PropTypes.string
};

export default StatCard;
