import dynamic from 'next/dynamic';
import { getPageMetadata } from '@/utils/getPageMetadata';

export async function generateMetadata() {
  return getPageMetadata('/soc-2', {
    title: 'SOC 2 Compliance Automation Platform | CalVant',
    description: 'Automate your SOC 2 compliance program with CalVant.',
    alternates: { canonical: 'https://calvant.com/soc-2' },
  });
}

const SOC2 = dynamic(() => import('@/modules/dashboard/FrameWorks/SOC2'));

export default function Page() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
        SOC 2 Compliance Automation Platform | CalVant
      </h1>
      <SOC2 />
    </>
  );
}
