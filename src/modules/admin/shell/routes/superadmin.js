// Pages
import { Home } from './pages'

// Icons
import ExploreIcon from '@mui/icons-material/Explore'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import SearchIcon from '@mui/icons-material/Search'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReportIcon from '@mui/icons-material/Report';
import HomeIcon from '@mui/icons-material/Home';
// Admin Components
import SEO_form_List from './components/SEO_form/SEO_form_List'
import Add_SEO_form from './components/SEO_form/Add_SEO_form'
import Edit_SEO_form from './components/SEO_form/Edit_SEO_form'
import Admins from './components/Admin/Admins'
import SampleRisk from './components/Risks/SampleRisk';
import BulkRisk from '../components/Risks/BulkRisk';



export default {
  items: [
    {
      path: '/',
      name: 'Home',
      type: 'link',
      icon: HomeIcon,
      component: Home,
      roles: ['super_admin']
    },
    // Admin 
     {
      path: '/admins',
      name: 'Admin',
      type: 'submenu',
      icon: AdminPanelSettingsIcon,
      badge: {
        type: 'primary',
        value: '1'
      },
      roles: ['super_admin'],
      children: [
        {
          path: '/admins/list',
          name: 'Roles',
          component: Admins
        }
      ]
    },
    //risk management
      {
      path: '/risks',
      name: 'Risk Management',
      type: 'submenu',
      icon: ReportIcon,
      badge: {
        type: 'primary',
        value: '1'
      },
      roles: ['super_admin'],
      children: [
        {
          path: '/risk_sample/bulk',
          name: 'Bulk Risks Upload',
          component: BulkRisk
        },
        {
          path: '/risk_sample/list',
          name: 'Sample Risks',
          component: SampleRisk
        }
      ]
    },
// SEO 
    {
      path: '/seo_form',
      name: 'SEO',
      type: 'submenu',
      icon: SearchIcon,
      badge: {
        type: 'primary',
        value: '3'
      },
      roles: ['admin'],
      children: [
        {
          path: '/list',
          name: 'SEO Form List',
          component: SEO_form_List
        },
        {
          path: '/edit/:id',
          name: 'Edit SEO Form',
          component: Edit_SEO_form,
          hideFromMenu: true
        },
        {
          path: '/add',
          name: 'Add SEO Form',
          component: Add_SEO_form
        }
      ]
    },
//Ris 
   

  ]
}
