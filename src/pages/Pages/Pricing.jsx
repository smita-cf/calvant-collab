import { Pricing, Wrapper } from '../../components'

import AppBar from '@mui/material/AppBar'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import React from 'react'
import Switch from '@mui/material/Switch'
import Toolbar from '@mui/material/Toolbar'
import { styled } from '@mui/material/styles'
import { mockPricing } from '../../utils/mock'

const useStyles = styled(theme => ({
  pricingTable: {
    marginTop: '-64px'
  },
  centered: {
    margin: '0 auto'
  },
  label: {
    color: '#ffffff'
  }
}))

const PricingPage = () => {
  const classes = useStyles()
  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <FormGroup row className={classes.centered}>
            <FormControlLabel
              control={<Switch value='payment' />}
              label='Pay annual to save 25%'
              classes={{
                label: classes.label
              }}
            />
          </FormGroup>
        </Toolbar>
        <Toolbar></Toolbar>
      </AppBar>

      <Wrapper padding={false}>
        <Grid
          container
          spacing={0}
          justify='center'
          className={classes.pricingTable}
        >
          <Grid item xs={10}>
            <Grid container spacing={1} direction='row' justify='center'>
              {mockPricing.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Pricing
                    title={item.title}
                    subtitle={item.subtitle}
                    price={item.price}
                    features={item.features}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Wrapper>
    </>
  )
}

export default PricingPage
