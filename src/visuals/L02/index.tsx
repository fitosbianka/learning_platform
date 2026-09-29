import type { LessonVisual } from '../types';
import { L02V01ZweiGebisse } from './L02_V01_ZweiGebisse';
import { L02V02Zahndurchbruch } from './L02_V02_Zahndurchbruch';
import { L02V03Zahntypen } from './L02_V03_Zahntypen';
import { L02V04Schaedel } from './L02_V04_Schaedel';

const visuals: LessonVisual[] = [
  { id: 'L02_V01', afterSection: 0, Component: L02V01ZweiGebisse },
  { id: 'L02_V02', afterSection: 2, Component: L02V02Zahndurchbruch },
  { id: 'L02_V03', afterSection: 1, Component: L02V03Zahntypen },
  { id: 'L02_V04', afterSection: 3, Component: L02V04Schaedel },
];

export default visuals;
