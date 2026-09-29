import {
  Bar,
  Bubble,
  Doughnut,
  Line,
  Pie,
  PolarArea,
  Radar
} from 'react-chartjs-2'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import { mockChart } from '../../utils/mock'

const Charts = () => (
  <Wrapper>
    <Grid container spacing={1}>
      {mockChart.map((chart, index) => (
        <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
          <Card>
            <CardHeader title={chart.title} subheader={chart.subtitle} />
            <CardContent>
              {chart.type === 'bar' && (
                <Bar
                  data={chart.data}
                  height={chart.height}
                  options={chart.options}
                />
              )}

              {chart.type === 'horizontalbar' && (
                <Bar
                  data={chart.data}
                  height={chart.height}
                  options={{
                    ...chart.options,
                    indexAxis: 'y' // 👈 makes it horizontal
                  }}
                />
              )}

              {chart.type === 'line' && (
                <Line
                  data={chart.data}
                  height={chart.height}
                  options={chart.options}
                />
              )}
              {chart.type === 'bubble' && (
                <Bubble
                  data={chart.data}
                  height={chart.height}
                  options={chart.options}
                />
              )}
              {chart.type === 'doughnut' && (
                <Doughnut
                  data={chart.data}
                  height={chart.height}
                  options={chart.options}
                />
              )}
              {chart.type === 'pie' && (
                <Pie
                  data={chart.data}
                  height={chart.height}
                  options={chart.options}
                />
              )}
              {chart.type === 'polar' && (
                <PolarArea
                  data={chart.data}
                  height={chart.height}
                  options={chart.options}
                />
              )}
              {chart.type === 'radar' && (
                <Radar
                  data={chart.data}
                  height={chart.height}
                  options={chart.options}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Wrapper>
)

export default Charts
