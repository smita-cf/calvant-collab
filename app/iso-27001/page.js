import ISO_27001 from '@/modules/dashboard/FrameWorks/ISO_27001';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/iso-27001', {
    title: 'ISO 27001 Compliance | CalVant',
    description: 'Streamline your ISO 27001 certification journey with CalVant.',
    alternates: { canonical: 'https://calvant.com/iso-27001' },
  });
}

export default function Page() {
  return <ISO_27001 />;
}