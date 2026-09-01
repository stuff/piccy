import type { Metadata } from 'next';

import Editor from '@/components/Editor';

export const metadata: Metadata = {
  title: 'Piccy Editor',
};

export default function EditPage() {
  return <Editor />;
}
