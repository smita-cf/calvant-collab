import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
    flex: '1 0 auto',
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

const PasswordReset = () => {
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
                    Enter your email and we'll send you instructions on how to
                    reset your password.
                  </Typography>
                </div>
                <TextField
                  id='email'
                  label='Email Address'
                  className={classes.textField}
                  fullWidth
                  margin='normal'
                />
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  className='mt-1'
                  type='submit'
                >
                  Send password reset
                </Button>
                <div className='pt-1 text-xs-center'>
                  <Link to='/signin'>
                    <Button>Sign</Button>
                  </Link>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Link to='/signup'>
                    <Button>Create new account.</Button>
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

export default PasswordReset
