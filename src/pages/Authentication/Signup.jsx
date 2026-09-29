import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { Link } from 'react-router-dom'
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
    flex: '1 0 o',
    flexDirection: 'column',
    minHeight: '100%',
    textAlign: 'center'
  },
  wrapper: {
    flex: 'none',
    maxWidth: '400px',
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

const Signup = () => {
  const classes = useStyles()
  return (
    <div className={classNames(classes.session, classes.background)}>
      <div className={classes.content}>
        <div className={classes.wrapper}>
          <Card>
            <CardContent>
              <form>
                <div
                  className={classNames(classes.logo, `text-xs-center pb-xs`)}
                >
                  <img
                    src={`/static/images/logo-dark.svg`}
                    alt=''
                  />
                  <Typography variant='caption'>
                    Create an app id to continue.
                  </Typography>
                </div>
                <TextField
                  id='email'
                  label='Email address'
                  className={classes.textField}
                  fullWidth
                  margin='normal'
                />
                <TextField
                  id='password'
                  label='Password'
                  className={classes.textField}
                  type='password'
                  fullWidth
                  margin='normal'
                />
                <TextField
                  id='cpassword'
                  label='Confirm Password'
                  className={classes.textField}
                  type='password'
                  fullWidth
                  margin='normal'
                />
                <FormControlLabel
                  control={<Checkbox value='checkedA' />}
                  label='I have read and agree to the terms of service.'
                  className={classes.fullWidth}
                />
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  type='submit'
                >
                  Create your account
                </Button>
                <div className='pt-1 text-xs-center'>
                  <Link to='/forgot'>
                    <Button>Forgot password?</Button>
                  </Link>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Link to='/signin'>
                    <Button>Access your account.</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Signup
