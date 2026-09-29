import type { LessonVisual } from '../types';
import { L01V01Landkarte } from './L01_V01_Landkarte';
import { L01V02Praxisteam } from './L01_V02_Praxisteam';
import { L01V03WegDerPatientin } from './L01_V03_WegDerPatientin';

const visuals: LessonVisual[] = [
  { id: 'L01_V01', afterSection: 0, Component: L01V01Landkarte },
  { id: 'L01_V02', afterSection: 1, Component: L01V02Praxisteam },
  { id: 'L01_V03', afterSection: 3, Component: L01V03WegDerPatientin },
];

export default visuals;
