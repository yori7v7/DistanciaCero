import LetterCollectionSection from './LetterCollectionSection'
import type { LetterCollectionConfig } from './LetterCollectionSection'
import type { LetterContent } from '../types/content'
import {
  getLegacyOpenWhenLetters,
  isOpenWhenLetterOpened,
  setOpenWhenLetterOpened,
} from '../services/contentService'

const openWhenConfig: LetterCollectionConfig = {
  collectionName: 'openWhenLetters',
  displayField: 'mood',
  sectionId: 'abrir-cuando',
  eyebrow: 'Abrir cuando...',
  title: 'Cartitas para momentos específicos',
  subtitle: 'Cada cartita se puede leer directamente aquí cuando sea su momento.',
  counterLabel: 'Cartas abiertas:',
  cardClass: 'open-card fade-up',
  isOpened: isOpenWhenLetterOpened,
  setOpened: setOpenWhenLetterOpened,
  getLegacyLetters: getLegacyOpenWhenLetters,
}

function OpenWhenSection({ cards = [] }: { cards: LetterContent[] }) {
  // Reserve this base card before the shared reader applies CMS overrides.
  const transformedCards = cards.map((card) => {
    if (card.mood === 'Abrir cuando sea un día especial') {
      return {
        ...card,
        title: 'Próximamente',
        preview: 'Este espacio queda reservado para una futura cartita especial.',
        locked: true,
      }
    }
    return card
  })

  return <LetterCollectionSection config={openWhenConfig} data={transformedCards} />
}

export default OpenWhenSection
