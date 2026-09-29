import type { LessonVisual } from '../types';
import { L09V01Kompositfuellung } from './L09_V01_Kompositfuellung';
import { L09V02Materialkarten } from './L09_V02_Materialkarten';
import { L09V03InlayOnlayKrone } from './L09_V03_InlayOnlayKrone';
import { L09V04AmpelBeschwerden } from './L09_V04_AmpelBeschwerden';

const visuals: LessonVisual[] = [
  { id: 'L09_V01', afterSection: 1, Component: L09V01Kompositfuellung },
  { id: 'L09_V02', afterSection: 2, Component: L09V02Materialkarten },
  { id: 'L09_V03', afterSection: 3, Component: L09V03InlayOnlayKrone },
  { id: 'L09_V04', afterSection: 4, Component: L09V04AmpelBeschwerden },
];

export default visuals;
