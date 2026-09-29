import type { LessonVisual } from '../types';
import { L07V01VierSaeulen } from './L07_V01_VierSaeulen';
import { L07V02BuersteErreicht } from './L07_V02_BuersteErreicht';
import { L07V03DhSitzung } from './L07_V03_DhSitzung';
import { L07V04RecallIntervall } from './L07_V04_RecallIntervall';

const visuals: LessonVisual[] = [
  { id: 'L07_V01', afterSection: -1, Component: L07V01VierSaeulen },
  { id: 'L07_V02', afterSection: 0, Component: L07V02BuersteErreicht },
  { id: 'L07_V03', afterSection: 4, Component: L07V03DhSitzung },
  { id: 'L07_V04', afterSection: 5, Component: L07V04RecallIntervall },
];

export default visuals;
