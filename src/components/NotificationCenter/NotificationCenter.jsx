import React, { useState } from 'react';
import {
  formatPrice,
  getStocks,
  getWeather,
  getWeatherIcon
} from '../../helpers';
import { mockNotifications, mockStats, mockTodo } from '../../utils/mock';

import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import PropTypes from 'prop-types';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import format from 'date-fns/format';
import { useTheme } from '@mui/material/styles';
import { notificationCenterWidth } from '../../styleVariables';
import useMountEffect from '../../mountEffect';

const NotificationCenter = ({ notificationsOpen, toogleNotifications }) => {
  const theme = useTheme();

  const [tab, setTab] = useState(1);
  const [stocks, setStocks] = useState(undefined);
  const [forecast, setForecast] = useState(undefined);
  const [today] = useState(Date.now());

  const handleTabToggle = (event, tab) => setTab(tab);

  useMountEffect(() => {
    (async function () {
      try {
        const forecastData = await getWeather('london', 'uk', 1);
        const stocksData = await getStocks('MSFT,FB,AAPL,GOOG,DAX');

        if (forecastData) {
          setForecast(forecastData);
        }
        if (stocksData && stocksData['Stock Quotes']) {
          setStocks(stocksData);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  });

  const drawerPaperSx = {
    width: notificationCenterWidth,
    maxWidth: notificationCenterWidth,
    zIndex: theme.zIndex.drawer + 99,
    [theme.breakpoints.down('sm')]: {
      top: '56px',
      height: 'calc(100vh - 56px)'
    },
    [theme.breakpoints.up('sm')]: {
      top: '64px',
      height: 'calc(100vh - 64px)'
    }
  };

  const drawerRootSx = {
    '& .MuiBackdrop-root': {
      [theme.breakpoints.down('sm')]: {
        top: '56px'
      },
      [theme.breakpoints.up('sm')]: {
        top: '64px'
      }
    }
  };

  const containerStyle = {
    position: 'relative',
    overflowX: 'hidden',
    overflowY: 'auto',
    zIndex: 1,
    flexGrow: 1
  };

  const tabsRootSx = {
    borderBottom: `1px solid ${theme.palette.divider}`
  };

  const tabRootSx = {
    textTransform: 'initial',
    minWidth: '50%',
    color: theme.palette.text.primary
  };

  const paddingStyle = {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
    },
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2)
    }
  };

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={notificationsOpen}
      onClose={toogleNotifications}
      ModalProps={{
        keepMounted: false,
        onBackdropClick: toogleNotifications
      }}
      PaperProps={{ sx: drawerPaperSx }}
      sx={drawerRootSx}
    >
      <Tabs
        value={tab}
        onChange={handleTabToggle}
        sx={tabsRootSx}
        centered
      >
        <Tab sx={tabRootSx} label="Today" />
        <Tab sx={tabRootSx} label="Notifications" />
      </Tabs>
      <div style={containerStyle}>
        {tab === 0 && (
          <>
            <div style={paddingStyle}>
              <Typography variant="h6" gutterBottom>
                {format(today, 'dddd')}
              </Typography>
              <Typography variant="subtitle1">
                {format(today, 'MMM Do yy')}
              </Typography>
            </div>
            {stocks && (
              <>
                <Divider />
                <List
                  component="nav"
                  subheader={
                    <ListSubheader disableSticky>Stocks</ListSubheader>
                  }
                >
                  {stocks['Stock Quotes'].map((stock, index) => (
                    <ListItem button key={index}>
                      <ListItemText primary={stock['1. symbol']} />
                      <ListItemSecondaryAction className="mx-1">
                        <Typography variant="caption">
                          {formatPrice(stock['2. price'])}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            {forecast && (
              <>
                <Divider />
                <List
                  subheader={
                    <ListSubheader disableSticky>Weather</ListSubheader>
                  }
                >
                  <ListItem button>
                    <ListItemText
                      primary={forecast.city.country}
                      secondary={forecast.city.name}
                    />
                    <ListItemSecondaryAction className="mx-1">
                      <Typography variant="h6">
                        <>
                          <i
                            className={classNames(
                              getWeatherIcon(
                                forecast.list[0].weather[0].icon
                              ),
                              'text-lg mx-1'
                            )}
                          />
                          {forecast.list[0].main.temp}
                        </>
                      </Typography>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </>
            )}
            <Divider />
            <List
              subheader={<ListSubheader disableSticky>Tasks</ListSubheader>}
            >
              {mockTodo.map((todo, index) => (
                <ListItem button key={index}>
                  <ListItemText
                    primary={todo.title}
                    secondary={todo.subtitle}
                  />
                </ListItem>
              ))}
            </List>
            <Divider />
            <List
              subheader={<ListSubheader disableSticky>Stats</ListSubheader>}
            >
              {mockStats.map((stat, index) => (
                <div style={paddingStyle} key={index}>
                  <Typography variant="caption">{stat.title}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stat.value}
                  />
                </div>
              ))}
            </List>
          </>
        )}
        {tab === 1 && (
          <List>
            {mockNotifications.map((notification, index) => (
              <ListItem button key={index}>
                {notification.avatar}
                <ListItemText
                  primary={notification.title}
                  secondary={notification.subtitle}
                />
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </Drawer>
  );
};

NotificationCenter.propTypes = {
  notificationsOpen: PropTypes.bool,
  toogleNotifications: PropTypes.func
};

export default NotificationCenter;
