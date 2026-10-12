import LetterCollectionSection from './LetterCollectionSection'
import {
  getLegacyMonthlyLetters,
  isMonthlyLetterOpened,
  setMonthlyLetterOpened,
} from '../services/contentService'
import type { LetterCollectionConfig } from './LetterCollectionSection'
import type { LetterContent } from '../types/content'

const monthlyConfig: LetterCollectionConfig = {
  collectionName: 'monthlyLetters',
  displayField: 'month',
  sectionId: 'cartas',
  eyebrow: 'Cartas mensuales',
  title: 'Un mes, una carta, un pedacito más de nosotros',
  subtitle: 'Cada carta se puede leer directamente aquí cuando llegue su momento.',
  counterLabel: 'Cartas abiertas:',
  isOpened: isMonthlyLetterOpened,
  setOpened: setMonthlyLetterOpened,
  getLegacyLetters: getLegacyMonthlyLetters,
}

function MonthlyLetters({ letters }: { letters: LetterContent[] }) {
  return <LetterCollectionSection config={monthlyConfig} data={letters} />
}

export default MonthlyLetters
