"use client";

import dynamic from 'next/dynamic';

const Policies = dynamic(() => import('@/modules/dashboard/Template/Policies'), { ssr: false });

export default function Page() {
  return <Policies />;
}