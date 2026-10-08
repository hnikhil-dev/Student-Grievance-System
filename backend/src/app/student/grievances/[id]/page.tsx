import React from 'react';
import { GrievanceDetail } from '@student/components';

export default async function GrievanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GrievanceDetail id={id} />;
}
