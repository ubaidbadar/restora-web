import { type ReactNode } from 'react';

export default interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}
