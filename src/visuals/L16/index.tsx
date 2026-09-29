import type { LessonVisual } from '../types';
import { L16V01KinderZeitstrahl } from './L16_V01_KinderZeitstrahl';
import { L16V02FruehkindlicheKaries } from './L16_V02_FruehkindlicheKaries';
import { L16V03Geraetetypen } from './L16_V03_Geraetetypen';
import { L16V04WerBezahltKfo } from './L16_V04_WerBezahltKfo';

const visuals: LessonVisual[] = [
  { id: 'L16_V01', afterSection: -1, Component: L16V01KinderZeitstrahl },
  { id: 'L16_V02', afterSection: 1, Component: L16V02FruehkindlicheKaries },
  { id: 'L16_V03', afterSection: 5, Component: L16V03Geraetetypen },
  { id: 'L16_V04', afterSection: 6, Component: L16V04WerBezahltKfo },
];

export default visuals;
