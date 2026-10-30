import type { ComponentType } from 'react';

export interface Quiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Chapter {
  id: number;
  title: string;
  english: string;
  source: string;
  summary: string;
  question: string;
  labName: string;
  objectives: string[];
  sections: { id: string; title: string; focus: string }[];
  misconception: string;
  quiz: Quiz;
  accent: 'blue' | 'orange' | 'aqua';
}

export interface LabProps {
  onComplete: () => void;
}

export type LabComponent = ComponentType<LabProps>;

export interface TeachingStep {
  label: string;
  title: string;
  explanation: string;
  formula?: string;
}
