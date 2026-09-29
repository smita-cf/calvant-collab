export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth-bridge',
          '/change-password',
          '/policies',
          '/procedures',
          '/reports',
          '/risk-assessment',
          '/gap-assessment',
          '/documentation',
          '/compliances',
          '/task-management',
          '/tprm',
          '/dpia',
          '/aiia',
          '/login',
        ],
      },
    ],
    sitemap: 'https://calvant.com/sitemap.xml',
  };
}