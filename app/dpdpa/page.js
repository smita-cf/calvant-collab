import dynamic from 'next/dynamic';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/dpdpa', {
    title: 'DPDPA Compliance | CalVant',
    description: 'How CalVant helps organizations comply with India Digital Personal Data Protection Act.',
    alternates: { canonical: 'https://calvant.com/dpdpa' },
  });
}

const DPDPA = dynamic(() => import('@/modules/dashboard/FrameWorks/DPDPA'));

export default function Page() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        India DPDPA Compliance Platform | CalVant
      </h1>
      <DPDPA />
    </>
  );
}
