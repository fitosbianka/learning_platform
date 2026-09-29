import type { LessonVisual } from '../types';
import { L14V01Prothesenarten } from './L14_V01_Prothesenarten';
import { L14V02SiebenTermine } from './L14_V02_SiebenTermine';
import { L14V03Hybridprothese } from './L14_V03_Hybridprothese';
import { L14V04NormalOderTermin } from './L14_V04_NormalOderTermin';

const visuals: LessonVisual[] = [
  { id: 'L14_V01', afterSection: 1, Component: L14V01Prothesenarten },
  { id: 'L14_V02', afterSection: 2, Component: L14V02SiebenTermine },
  { id: 'L14_V03', afterSection: 1, Component: L14V03Hybridprothese },
  { id: 'L14_V04', afterSection: 3, Component: L14V04NormalOderTermin },
];

export default visuals;
