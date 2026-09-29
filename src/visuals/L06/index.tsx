import type { LessonVisual } from '../types';
import { L06V01GesundGingivitisParo } from './L06_V01_GesundGingivitisParo';
import { L06V02Sondieren } from './L06_V02_Sondieren';
import { L06V03PsiTabelle } from './L06_V03_PsiTabelle';
import { L06V04StadiumGrad } from './L06_V04_StadiumGrad';

const visuals: LessonVisual[] = [
  { id: 'L06_V01', afterSection: 1, Component: L06V01GesundGingivitisParo },
  { id: 'L06_V02', afterSection: 3, Component: L06V02Sondieren },
  { id: 'L06_V03', afterSection: 4, Component: L06V03PsiTabelle },
  { id: 'L06_V04', afterSection: 5, Component: L06V04StadiumGrad },
];

export default visuals;
