import type { LessonVisual } from '../types';
import { L08V01Roentgenarten } from './L08_V01_Roentgenarten';
import { L08V02OptAnimation } from './L08_V02_OptAnimation';
import { L08V03Dosisvergleich } from './L08_V03_Dosisvergleich';
import { L08V04BefundBisKV } from './L08_V04_BefundBisKV';

const visuals: LessonVisual[] = [
  { id: 'L08_V01', afterSection: 1, Component: L08V01Roentgenarten },
  { id: 'L08_V02', afterSection: 1, Component: L08V02OptAnimation },
  { id: 'L08_V03', afterSection: 2, Component: L08V03Dosisvergleich },
  { id: 'L08_V04', afterSection: 4, Component: L08V04BefundBisKV },
];

export default visuals;
