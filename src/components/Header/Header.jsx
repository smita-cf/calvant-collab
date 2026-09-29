import React, { useState } from 'react';
import { clearAuthAndRedirect } from '../../utils/authUtils';
import { captureActivity } from '../../services/activities';

import AccountBoxIcon from '@mui/icons-material/AccountBox';
import AppBar from '@mui/material/AppBar';
import Collapse from '@mui/material/Collapse';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import PropTypes from 'prop-types';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import Toolbar from '@mui/material/Toolbar';
import { styled, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: '#fff',
  boxShadow: '0 1px 8px rgba(0,0,0,.3)',
  position: 'relative',
  zIndex: theme.zIndex.drawer + 100,
  [theme.breakpoints.down('sm')]: {
    position: 'fixed'
  }
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(1) / 2,
  paddingRight: theme.spacing(1) / 2
}));

const Branding = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  margin: 'auto 0',
  lineHeight: '50px',
  padding: `0 64px 0 0`
});

const Logo = styled('img')(({ theme }) => ({
  marginLeft: '20px',
  padding: '5px',
  height: '60px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '80px',
    marginLeft: '0px'
  }
}));

const SearchWrapper = styled('div')({
  flex: '1 1 0%',
  boxSizing: ' border-box'
});

const SearchForm = styled('form')(({ theme }) => ({
  background: 'white',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  marginRight: theme.spacing(1) * 2,
  display: 'block',
  maxWidth: '800px'
}));

const SearchInput = styled('input')(({ theme }) => ({
  fontSize: '1rem',
  padding: theme.spacing(1) * 1.9,
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(1) * 1.2
  },
  cursor: 'text',
  textIndent: '30px',
  border: 'none',
  background: 'transparent',
  width: '100%',
  outline: '0'
}));

const Logout = styled('div')({
  right: '10px',
  position: 'absolute',
  borderRadius: '4px',
});

const Header = ({
  logo,
  logoAltText,
  toggleFullscreen,
  toggleDrawer,
  toogleNotifications
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSettingdToggle = (event) => setAnchorEl(event.currentTarget);

  const handleCloseMenu = () => setAnchorEl(null);

  const handleSearchExpandToggle = () => setSearchExpanded(!searchExpanded);

  const handleDrawerToggle = () => {
    toggleDrawer();
    if (searchExpanded) handleSearchExpandToggle();
  };

  const handleNotificationToggle = () => {
    toogleNotifications();
    if (searchExpanded) handleSearchExpandToggle();
  };

  const handleLogout = async () => {
    // ── Activity log: LOGOUT ─────────────────────────────────────────────────
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    await captureActivity({
      action: "LOGOUT",
      name: user.name || localStorage.getItem('uname') || 'Unknown',
      email: user.email || localStorage.getItem('email') || 'unknown@example.com',
      url: window.location.pathname,
      item: null,
    });
    clearAuthAndRedirect(true);
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <IconButton
          color="black"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>

        <Branding>
          <Logo src={logo} alt={logoAltText} />
        </Branding>

        <Logout>
          <Button
            variant='contained'
            onClick={() => {
              handleLogout();
            }}
          >
            Logout
          </Button>
        </Logout>

        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleCloseMenu}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <MenuItem onClick={handleCloseMenu}>
            <ListItemIcon>
              <AccountBoxIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </MenuItem>
          <MenuItem onClick={handleCloseMenu}>
            <ListItemIcon>
              <NotificationsOffIcon />
            </ListItemIcon>
            <ListItemText primary="Disable notifications" />
          </MenuItem>
          <MenuItem onClick={() => { handleCloseMenu(); handleLogout(); }}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </MenuItem>
        </Menu>
      </StyledToolbar>
      {isMobile && (
        <Collapse in={searchExpanded} timeout="auto" unmountOnExit>
          <StyledToolbar>
            <SearchWrapper>
              <SearchForm className="mr-0">
                <IconButton
                  aria-label="Search"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    marginTop: '-24px',
                    color: 'rgba(0,0,0,.87)'
                  }}
                >
                  <SearchIcon />
                </IconButton>
                <SearchInput
                  type="text"
                  placeholder="Search"
                  autoFocus={true}
                />
              </SearchForm>
            </SearchWrapper>
          </StyledToolbar>
        </Collapse>
      )}
    </StyledAppBar>
  );
};

Header.propTypes = {
  logo: PropTypes.string,
  logoAltText: PropTypes.string,
  toggleFullscreen: PropTypes.func,
  toggleDrawer: PropTypes.func,
  toogleNotifications: PropTypes.func
};

export default Header;
