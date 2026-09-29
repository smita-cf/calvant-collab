"use client";

import dynamic from 'next/dynamic';

const AuthBridge = dynamic(() => import('@/modules/departments/pages/AuthBridge'), { ssr: false });

export default function AuthBridgePage() {
  return <AuthBridge />;
}