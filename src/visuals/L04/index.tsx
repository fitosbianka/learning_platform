import type { LessonVisual } from '../types';
import { L04V01Zahnquerschnitt } from './L04_V01_Zahnquerschnitt';
import { L04V02Parodontitis } from './L04_V02_Parodontitis';
import { L04V03WoherSchmerz } from './L04_V03_WoherSchmerz';

const visuals: LessonVisual[] = [
  { id: 'L04_V01', afterSection: 1, Component: L04V01Zahnquerschnitt },
  { id: 'L04_V02', afterSection: 2, Component: L04V02Parodontitis },
  { id: 'L04_V03', afterSection: 3, Component: L04V03WoherSchmerz },
];

export default visuals;
