import FooterContentPage from '@/footer-pages/FooterContentPage';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/security', {
    title: 'Security | CalVant',
    description: 'How CalVant keeps your data secure.',
    alternates: { canonical: 'https://calvant.com/security' },
  });
}

async function getFooterContent(type) {
  try {
    const res = await fetch(
      `https://api.calvant.com/footer-service/api/footer-content/type/${type}`,
      {
        headers: {
          'Origin': 'https://calvant.com',
          'Referer': 'https://calvant.com/',
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Page() {
  const data = await getFooterContent('security');
  return <FooterContentPage type="security" prefetchedData={data} />;
}