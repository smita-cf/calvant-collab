"use client";

import dynamic from 'next/dynamic';

const Procedures = dynamic(() => import('@/modules/dashboard/Template/Procedures'), { ssr: false });

export default function Page() {
  return <Procedures />;
}