// FIX: Import React to provide the JSX namespace and resolve the compilation error.
import React from 'react';

export interface Task {
  id: string;
  text: string;
  details?: string;
  completed: boolean;
}

export type SectionType = 'checklist' | 'update' | 'next-steps';

export interface SectionData {
  title: string;
  type: SectionType;
  icon: JSX.Element;
  tasks: Task[];
}