import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListSubheader from '@material-ui/core/ListSubheader'

import NavList from './NavList'
import { LibraryMusic, PlaylistPlay, QueueMusic } from '@material-ui/icons'

const SidebarNav = props => {
  const { isCollapsed } = props
  const classes = useStyles()

  const itemsCore = [
    {
      name: 'Home',
      link: '/',
      Icon: LibraryMusic,
    },
    {
      name: 'Playlist',
      Icon: PlaylistPlay,
      items: [
        {
          name: 'Favorite',
          link: '/playlist/fav',
        },
        {
          name: 'My Playlist',
          link: '/playlist/myplaylist',
        }
      ],
    }
  ]

  return (
    <div>
      <List className={classes.navList} disablePadding>
        <NavList isCollapsed={isCollapsed} items={itemsCore} />
      </List>
    </div>
  )
}

const useStyles = makeStyles(theme =>
  createStyles({
    navList: {
      width: theme.sidebar.width,
      fontSize: '1.1em',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    navListHeader: {
      textAlign: 'center',
      color: 'rgba(255,255,255,0.5)',
    },
    iconFeatures: {
      color: '#95de3c',
    },
    iconDocs: {
      color: '#f8cda9',
    },
    iconSupporters: {
      color: '#e3b546',
    },
    iconDiscuss: {
      color: '#ccc',
    },
  }),
)

export default SidebarNav
