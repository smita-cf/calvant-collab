import dynamic from 'next/dynamic';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/iso-42001', {
    title: 'ISO 42001 AI Management | CalVant',
    description: 'Manage AI risks and compliance with ISO 42001 using CalVant.',
    alternates: { canonical: 'https://calvant.com/iso-42001' },
  });
}

const ISO_42001 = dynamic(() => import('@/modules/dashboard/FrameWorks/ISO_42001'));

export default function Page() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        ISO 42001 AI Management | CalVant
      </h1>
      <ISO_42001 />
    </>
  );
}
