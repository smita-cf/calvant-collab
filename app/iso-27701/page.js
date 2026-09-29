import ISO_27701 from '@/modules/dashboard/FrameWorks/ISO_27701';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/iso-27701', {
    title: 'ISO 27701 Privacy Compliance | CalVant',
    description: 'Privacy Information Management with ISO 27701 on CalVant.',
    alternates: { canonical: 'https://calvant.com/iso-27701' },
  });
}

export default function Page() {
  return <ISO_27701 />;
}