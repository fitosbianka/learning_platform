import type { LessonVisual } from '../types';
import { L05V01Saeureangriff } from './L05_V01_Saeureangriff';
import { L05V02Kariesstadien } from './L05_V02_Kariesstadien';
import { L05V03WoKaries } from './L05_V03_WoKaries';
import { L05V04Waage } from './L05_V04_Waage';

const visuals: LessonVisual[] = [
  { id: 'L05_V01', afterSection: 0, Component: L05V01Saeureangriff },
  { id: 'L05_V02', afterSection: 1, Component: L05V02Kariesstadien },
  { id: 'L05_V03', afterSection: 2, Component: L05V03WoKaries },
  { id: 'L05_V04', afterSection: 0, Component: L05V04Waage },
];

export default visuals;
