import type { LessonVisual } from '../types';
import { L11V01ZurKrone } from './L11_V01_ZurKrone';
import { L11V02Materialvergleich } from './L11_V02_Materialvergleich';
import { L11V03BrueckeImplantat } from './L11_V03_BrueckeImplantat';
import { L11V04KronenRechnung } from './L11_V04_KronenRechnung';

const visuals: LessonVisual[] = [
  { id: 'L11_V01', afterSection: 1, Component: L11V01ZurKrone },
  { id: 'L11_V02', afterSection: 2, Component: L11V02Materialvergleich },
  { id: 'L11_V03', afterSection: 3, Component: L11V03BrueckeImplantat },
  { id: 'L11_V04', afterSection: 5, Component: L11V04KronenRechnung },
];

export default visuals;
