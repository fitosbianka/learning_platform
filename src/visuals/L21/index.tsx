import type { LessonVisual } from '../types';
import { L21V01Fallkarten } from './L21_V01_Fallkarten';
import { L21V02DreiFragen } from './L21_V02_DreiFragen';
import { L21V03AbschlussLandkarte } from './L21_V03_AbschlussLandkarte';

const visuals: LessonVisual[] = [
  { id: 'L21_V01', afterSection: -1, Component: L21V01Fallkarten },
  { id: 'L21_V02', afterSection: 7, Component: L21V02DreiFragen },
  { id: 'L21_V03', afterSection: 8, Component: L21V03AbschlussLandkarte },
];

export default visuals;
