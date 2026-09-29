import React from 'react';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';

const Root = styled('main')(({ theme }) => ({
  flexGrow: 1,
  minHeight: 0,          // ✅ REQUIRED for flex scrolling
  minWidth: 0,
  padding: theme.spacing(0),
  overflowY: 'auto',     // ✅ vertical scroll only
  overflowX: 'hidden',   // ✅ prevent horizontal scroll
  height: '100%',
  display: 'flex',
  flexDirection: 'column',

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));


const Workspace = ({ children, opened }) => {
  return (
    <Root className={classNames('workspace', { 'workspace-opened': opened })}>
      {children}
    </Root>
  );
};

export default Workspace;