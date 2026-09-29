import type { LessonVisual } from '../types';
import { L19V01Fragebogen } from './L19_V01_Fragebogen';
import { L19V02Risikogruppen } from './L19_V02_Risikogruppen';
import { L19V03BlutverduennerWaage } from './L19_V03_BlutverduennerWaage';
import { L19V04Schwangerschaft } from './L19_V04_Schwangerschaft';

const visuals: LessonVisual[] = [
  { id: 'L19_V01', afterSection: 0, Component: L19V01Fragebogen },
  { id: 'L19_V02', afterSection: 6, Component: L19V02Risikogruppen },
  { id: 'L19_V03', afterSection: 1, Component: L19V03BlutverduennerWaage },
  { id: 'L19_V04', afterSection: 5, Component: L19V04Schwangerschaft },
];

export default visuals;
