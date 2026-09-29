import type { LessonVisual } from '../types';
import { L10V01Wurzelbehandlung } from './L10_V01_Wurzelbehandlung';
import { L10V02PulpaZustaende } from './L10_V02_PulpaZustaende';
import { L10V03ErhaltenOderErsetzen } from './L10_V03_ErhaltenOderErsetzen';
import { L10V04ApikaleAufhellung } from './L10_V04_ApikaleAufhellung';

const visuals: LessonVisual[] = [
  { id: 'L10_V01', afterSection: 1, Component: L10V01Wurzelbehandlung },
  { id: 'L10_V02', afterSection: 0, Component: L10V02PulpaZustaende },
  { id: 'L10_V03', afterSection: 3, Component: L10V03ErhaltenOderErsetzen },
  { id: 'L10_V04', afterSection: 2, Component: L10V04ApikaleAufhellung },
];

export default visuals;
