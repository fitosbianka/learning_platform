import type { LessonVisual } from '../types';
import { L17V01Ampeltafel } from './L17_V01_Ampeltafel';
import { L17V02AusgeschlagenerZahn } from './L17_V02_AusgeschlagenerZahn';
import { L17V03MedizinischeNotfaelle } from './L17_V03_MedizinischeNotfaelle';
import { L17V04NotfallCheckliste } from './L17_V04_NotfallCheckliste';

const visuals: LessonVisual[] = [
  { id: 'L17_V01', afterSection: 0, Component: L17V01Ampeltafel },
  { id: 'L17_V02', afterSection: 2, Component: L17V02AusgeschlagenerZahn },
  { id: 'L17_V03', afterSection: 4, Component: L17V03MedizinischeNotfaelle },
  { id: 'L17_V04', afterSection: 5, Component: L17V04NotfallCheckliste },
];

export default visuals;
