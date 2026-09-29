import type { LessonVisual } from '../types';
import { L13V01DreiTeile } from './L13_V01_DreiTeile';
import { L13V02Zeitstrahl } from './L13_V02_Zeitstrahl';
import { L13V03Osseointegration } from './L13_V03_Osseointegration';
import { L13V04Sinuslift } from './L13_V04_Sinuslift';

const visuals: LessonVisual[] = [
  { id: 'L13_V01', afterSection: 0, Component: L13V01DreiTeile },
  { id: 'L13_V02', afterSection: 2, Component: L13V02Zeitstrahl },
  { id: 'L13_V03', afterSection: 0, Component: L13V03Osseointegration },
  { id: 'L13_V04', afterSection: 3, Component: L13V04Sinuslift },
];

export default visuals;
