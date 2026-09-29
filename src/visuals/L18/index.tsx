import type { LessonVisual } from '../types';
import { L18V01Kreislauf } from './L18_V01_Kreislauf';
import { L18V02Autoklav } from './L18_V02_Autoklav';
import { L18V03Grundriss } from './L18_V03_Grundriss';
import { L18V04Nadelstich } from './L18_V04_Nadelstich';
import { L18V05Materialgruppen } from './L18_V05_Materialgruppen';

const visuals: LessonVisual[] = [
  { id: 'L18_V01', afterSection: 2, Component: L18V01Kreislauf },
  { id: 'L18_V02', afterSection: 3, Component: L18V02Autoklav },
  { id: 'L18_V03', afterSection: 4, Component: L18V03Grundriss },
  { id: 'L18_V04', afterSection: 1, Component: L18V04Nadelstich },
  { id: 'L18_V05', afterSection: 5, Component: L18V05Materialgruppen },
];

export default visuals;
