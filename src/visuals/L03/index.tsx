import type { LessonVisual } from '../types';
import { L03V01Zahnschema } from './L03_V01_Zahnschema';
import { L03V02ZahnFinden } from './L03_V02_ZahnFinden';
import { L03V03Zahnflaechen } from './L03_V03_Zahnflaechen';
import { L03V04ModAnimation } from './L03_V04_ModAnimation';

const visuals: LessonVisual[] = [
  { id: 'L03_V01', afterSection: 0, Component: L03V01Zahnschema },
  { id: 'L03_V02', afterSection: 1, Component: L03V02ZahnFinden },
  { id: 'L03_V03', afterSection: 2, Component: L03V03Zahnflaechen },
  { id: 'L03_V04', afterSection: 2, Component: L03V04ModAnimation },
];

export default visuals;
