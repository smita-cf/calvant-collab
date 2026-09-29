import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import React from 'react'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import classNames from 'classnames'
import { styled } from '@mui/material/styles'

const useStyles = styled(theme => ({
  card: {
    overflow: 'visible'
  },
  session: {
    position: 'relative',
    zIndex: 4000,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  background: {
    backgroundColor: theme.palette.primary.main
  },
  content: {
    padding: `40px ${theme.spacing(1)}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 0 auto',
    flexDirection: 'column',
    minHeight: '100%',
    textAlign: 'center'
  },
  avatar: {
    position: 'relative',
    display: 'block',
    margin: '-75px auto 0'
  },
  lockscreenWrapper: {
    flex: 'none',
    maxWidth: '280px',
    width: '100%',
    margin: '0 auto'
  },
  fullWidth: {
    width: '100%'
  },
  logo: {
    display: 'flex',
    flexDirection: 'column'
  }
}))

const Lockscreen = () => {
  const classes = useStyles()
  return (
    <div className={classNames(classes.session, classes.background)}>
      <div className={classes.content}>
        <div className={classes.lockscreenWrapper}>
          <Card className={classes.card}>
            <CardContent>
              <form>
                <div className={classes.avatar}>
                  <img
                    src={`/static/images/avatar.jpg`}
                    alt='user'
                    title='user'
                  />
                </div>
                <Typography variant='body1' className='mt-1'>
                  David Miller
                </Typography>
                <TextField
                  id='username'
                  label='Username'
                  className={classNames(classes.textField, 'mt-0 mb-1')}
                  fullWidth
                  margin='normal'
                />
                <Button variant='contained' color='primary' type='submit'>
                  Unlock
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Lockscreen
