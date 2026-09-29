import type { LessonVisual } from '../types';
import { L15V01VierStufen } from './L15_V01_VierStufen';
import { L15V02Instrumentierung } from './L15_V02_Instrumentierung';
import { L15V03Reevaluation } from './L15_V03_Reevaluation';
import { L15V04ParoJahr } from './L15_V04_ParoJahr';

const visuals: LessonVisual[] = [
  { id: 'L15_V01', afterSection: -1, Component: L15V01VierStufen },
  { id: 'L15_V02', afterSection: 1, Component: L15V02Instrumentierung },
  { id: 'L15_V03', afterSection: 1, Component: L15V03Reevaluation },
  { id: 'L15_V04', afterSection: 3, Component: L15V04ParoJahr },
];

export default visuals;
