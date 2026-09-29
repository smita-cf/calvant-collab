import React, { useState, useEffect, useRef } from "react";
import Drawer from "@mui/material/Drawer";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import SidebarItem from "./SidebarItem";
import { useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { drawerWidth } from "../../styleVariables";

const miniDrawerWidth = 72;

const Sidebar = ({ opened, toggleDrawer, routes }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeRoute, setActiveRoute] = useState(undefined);
  const [isHovered, setIsHovered] = useState(false);

  const drawerRef = useRef(null);
  const hoverTimeout = useRef(null);

  // ✅ Safer click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        opened &&
        !isMobile &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target)
      ) {
        toggleDrawer();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [opened, isMobile, toggleDrawer]);

  // ✅ Clean hover handlers (no flicker)
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setIsHovered(false);
    }, 0  );
  };

  const toggleMenu = (index) => {
    setActiveRoute((prev) => (prev === index ? undefined : index));
  };

  // ✅ Expansion logic
  const isExpanded = isMobile ? opened : opened || isHovered;

  // ⚠️ Keep this if you WANT overlay-on-hover
  const layoutWidth = opened && !isMobile ? drawerWidth : miniDrawerWidth;

  // 👉 If you want PUSH layout on hover instead, use this instead:
  // const layoutWidth = isExpanded && !isMobile ? drawerWidth : miniDrawerWidth;

  const paperWidth = isExpanded ? drawerWidth : miniDrawerWidth;

  const menu = (
    <List component="div" disablePadding sx={{ mt: 1 }}>
      {routes.map((route, index) => (
        <SidebarItem
          key={index}
          index={index}
          route={route}
          activeRoute={activeRoute}
          toggleMenu={toggleMenu}
          setActiveRoute={setActiveRoute}
          currentPath={location.pathname.startsWith(route.path)} // ✅ fixed
          isExpanded={isExpanded}
        />
      ))}
    </List>
  );

  const drawerSx = {
    flexShrink: 0,
    whiteSpace: "nowrap",
    "& .MuiDrawer-paper": {
      boxSizing: "border-box",
      paddingTop: { xs: 0, sm: "64px" },
      overflowX: "hidden",
      backgroundColor: "#ffffff",
      borderRight: "1px solid rgba(226, 232, 240, 0.8)",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.easeInOut,
        duration: 300,
      }),
      boxShadow:
        isExpanded && !opened && !isMobile
          ? "10px 0 20px rgba(0,0,0,0.04)"
          : "none",
    },
  };

  // 📱 MOBILE DRAWER
  if (isMobile) {
    return (
      <SwipeableDrawer
        variant="temporary"
        open={opened}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
        PaperProps={{
          sx: {
            width: drawerWidth,
            top: { xs: 56, sm: 64 },
            height: { xs: "calc(100% - 56px)", sm: "calc(100% - 64px)" },
            backgroundColor: "#ffffff",
          },
        }}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
      >
        {menu}
      </SwipeableDrawer>
    );
  }

  // 🖥 DESKTOP DRAWER
  return (
    <Drawer
      ref={drawerRef}
      variant="permanent"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        ...drawerSx,
        width: layoutWidth,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.easeInOut,
          duration: 300,
        }),
        "& .MuiDrawer-paper": {
          ...drawerSx["& .MuiDrawer-paper"],
          width: paperWidth,
          position: opened ? "relative" : "absolute",
          height: "100%",
          zIndex: theme.zIndex.drawer + (isExpanded && !opened ? 1 : 0),
        },
      }}
    >
      {menu}
    </Drawer>
  );
};

export default Sidebar;
