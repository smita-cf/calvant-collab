import { getPageMetadata } from '@/utils/getPageMetadata';
import HomePageClient from '@/components/HomePageClient';

export async function generateMetadata() {
  return getPageMetadata('/', {
    title: 'CalVant | ISO Compliance & Risk Management Platform',
    description: 'Empower your organization with CalVant compliance platform.',
  });
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CalVant',
  url: 'https://calvant.com',
  sameAs: [
    'https://www.linkedin.com/company/calvant',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@calvant.com',
    contactType: 'customer support',
  },
};

const hiddenH1Style = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <h1 style={hiddenH1Style}>
        CalVant — AI-Powered Compliance & Risk Management Platform
      </h1>
      <HomePageClient />
    </>
  );
}