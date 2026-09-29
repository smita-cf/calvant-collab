import FooterContentPage from '@/footer-pages/FooterContentPage';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/privacy', {
    title: 'Privacy Policy | CalVant',
    description: 'CalVant privacy policy and data handling practices.',
    alternates: { canonical: 'https://calvant.com/privacy' },
  });
}

// Server-side fetch — runs at build/request time, NOT in browser
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
  const data = await getFooterContent('privacy');

  return (
    <FooterContentPage
      type="privacy"
      prefetchedData={data} // ← pass server data as prop
    />
  );
}