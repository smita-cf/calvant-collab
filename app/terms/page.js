import FooterContentPage from '@/footer-pages/FooterContentPage';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/terms', {
    title: 'Terms of Service | CalVant',
    description: 'CalVant terms of service and usage policies.',
    alternates: { canonical: 'https://calvant.com/terms' },
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
  const data = await getFooterContent('terms');
  return <FooterContentPage type="terms" prefetchedData={data} />;
}