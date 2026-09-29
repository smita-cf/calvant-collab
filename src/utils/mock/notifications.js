import Avatar from '@mui/material/Avatar'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import InfoIcon from '@mui/icons-material/Info'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import NotificationsPausedIcon from '@mui/icons-material/NotificationsPaused'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PhoneMissedIcon from '@mui/icons-material/PhoneMissed'
import React from 'react'
import indigo from '@mui/material/colors/indigo'
import moment from 'moment'
import red from '@mui/material/colors/red'
import yellow from '@mui/material/colors/yellow'

const styles = {
  indigoText: {
    color: indigo[500],
    backgroundColor: 'transparent'
  },
  redText: {
    color: red[500],
    backgroundColor: 'transparent'
  },
  yellowText: {
    color: yellow[500],
    backgroundColor: 'transparent'
  },
  defaultText: {
    backgroundColor: 'transparent',
    color: 'inherit'
  }
}

const date = Date.now()

export const mockNotifications = [
  {
    avatar: (
      <Avatar style={{ ...styles.indigoText }}>
        <PeopleIcon />
      </Avatar>
    ),
    title: 'Social',
    subtitle: 'Euismod Ullamcorper Malesuada'
  },
  {
    avatar: (
      <Avatar style={{ ...styles.redText }}>
        <LocalOfferIcon />
      </Avatar>
    ),
    title: 'Promotions',
    subtitle: 'Mattis Malesuada Porta'
  },
  {
    avatar: (
      <Avatar style={{ ...styles.yellowText }}>
        <InfoIcon />
      </Avatar>
    ),
    title: 'Updates',
    subtitle: 'Amet Sem Commodo'
  },
  {
    avatar: (
      <Avatar style={{ ...styles.defaultText }}>
        <DeleteSweepIcon />
      </Avatar>
    ),
    title: 'Removed 6 items from task list',
    subtitle: moment(date).format('MMMM Do YYYY, h:mm:ss a')
  },
  {
    avatar: (
      <Avatar style={{ ...styles.defaultText }}>
        <CheckCircleIcon />
      </Avatar>
    ),
    title: 'Completed 2 projects',
    subtitle: moment(new Date(date - 1000 * 60 * 60)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  },
  {
    avatar: (
      <Avatar style={{ ...styles.defaultText }}>
        <NotificationsPausedIcon />
      </Avatar>
    ),
    title: 'Muted notifications',
    subtitle: moment(new Date(date - 1000 * 60 * 60 * 2)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  },
  {
    avatar: (
      <Avatar style={{ ...styles.defaultText }}>
        <PersonAddIcon />
      </Avatar>
    ),
    title: 'Added Joek to contact list',
    subtitle: moment(new Date(date - 1000 * 60 * 60 * 3)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  },
  {
    avatar: (
      <Avatar style={{ ...styles.defaultText }}>
        <PhoneMissedIcon />
      </Avatar>
    ),
    title: 'Missed live call from Ellie',
    subtitle: moment(new Date(date - 1000 * 60 * 60 * 6)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  },
  {
    avatar: (
      <Avatar style={{ ...styles.defaultText }}>
        <GroupAddIcon />
      </Avatar>
    ),
    title: "You've been added to HR group",
    subtitle: moment(new Date(date - 1000 * 60 * 60 * 10)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  }
]

export const mockTodo = [
  {
    title: 'Learn React',
    subtitle: moment(new Date(date - 1000 * 60 * 60 * 3)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  },
  {
    title: 'Learn React Native',
    subtitle: moment(new Date(date - 1000 * 60 * 60 * 6)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  },
  {
    title: 'Write Documentation',
    subtitle: moment(new Date(date - 1000 * 60 * 60 * 10)).format(
      'MMMM Do YYYY, h:mm:ss a'
    )
  }
]

export const mockStats = [
  {
    title: 'Local storage',
    value: 30
  },
  {
    title: 'Cloud storage ',
    value: 80
  },
  {
    title: 'Local storage',
    value: 20
  }
]
