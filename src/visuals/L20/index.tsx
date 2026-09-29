import type { LessonVisual } from '../types';
import { L20V01Taxpunktrechner } from './L20_V01_Taxpunktrechner';
import { L20V02WerBezahlt } from './L20_V02_WerBezahlt';
import { L20V03Beispielrechnung } from './L20_V03_Beispielrechnung';
import { L20V04TiersGarantPayant } from './L20_V04_TiersGarantPayant';
import { L20V05Aufbewahrung } from './L20_V05_Aufbewahrung';

const visuals: LessonVisual[] = [
  { id: 'L20_V01', afterSection: 1, Component: L20V01Taxpunktrechner },
  { id: 'L20_V02', afterSection: 2, Component: L20V02WerBezahlt },
  { id: 'L20_V03', afterSection: 4, Component: L20V03Beispielrechnung },
  { id: 'L20_V04', afterSection: 2, Component: L20V04TiersGarantPayant },
  { id: 'L20_V05', afterSection: 5, Component: L20V05Aufbewahrung },
];

export default visuals;
