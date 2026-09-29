import dynamic from 'next/dynamic';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/ksa-pdpl', {
    title: 'KSA PDPL Compliance | CalVant',
    description: 'Saudi Arabia Personal Data Protection Law compliance with CalVant.',
    alternates: { canonical: 'https://calvant.com/ksa-pdpl' },
  });
}

const KSA_PDPL = dynamic(() => import('@/modules/dashboard/FrameWorks/KSA_PDPL'));

export default function Page() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        Saudi Arabia KSA PDPL Compliance Software | CalVant
      </h1>
      <KSA_PDPL />
    </>
  );
}
