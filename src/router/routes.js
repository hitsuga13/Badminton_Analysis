const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'login', component: () => import('@/pages/LoginPage.vue') },
      { path: 'live-match', component: () => import('@/pages/LiveMatchPage.vue') },
      { path: 'players', component: () => import('@/pages/PlayersPage.vue') },
      {
        path: 'history',
        component: () => import('@/pages/UtilityPage.vue'),
        props: {
          title: 'Match History Module',
          subtitle: 'Under Construction',
        },
      },
      {
        path: 'settings',
        component: () => import('@/pages/UtilityPage.vue'),
        props: {
          title: 'System Settings Module',
          subtitle: 'Under Construction',
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
