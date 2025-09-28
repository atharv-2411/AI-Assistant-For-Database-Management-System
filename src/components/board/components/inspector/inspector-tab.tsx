"use client";

import { TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle } from 'lucide-react';
import React from 'react'

type Props = {
  loading?: boolean;
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
}

export default function CodeEditorTab({
  loading=false,
  children,
  value,
  disabled=false,
}: Props) {
  return <TabsTrigger disabled={disabled} value={value} className='gap-1 items-center justify-center'>
    {
      loading && <LoaderCircle size={12} className='animate-spin' />
    }
    {children}
  </TabsTrigger>

}