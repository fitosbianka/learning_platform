import type { LessonVisual } from '../types';
import { L12V01InfiltrationLeitung } from './L12_V01_InfiltrationLeitung';
import { L12V02SiebenTage } from './L12_V02_SiebenTage';
import { L12V03AmpelAnruf } from './L12_V03_AmpelAnruf';
import { L12V04WeisheitszahnNerv } from './L12_V04_WeisheitszahnNerv';

const visuals: LessonVisual[] = [
  { id: 'L12_V01', afterSection: 0, Component: L12V01InfiltrationLeitung },
  { id: 'L12_V02', afterSection: 3, Component: L12V02SiebenTage },
  { id: 'L12_V03', afterSection: 4, Component: L12V03AmpelAnruf },
  { id: 'L12_V04', afterSection: 5, Component: L12V04WeisheitszahnNerv },
];

export default visuals;
