import { getRandomItems } from '@/utils/array';
import { getRandomCardsFromDeck } from '@/utils/cards';
import hitLocations from './hit-locations';
import basicAi from './basic-ai';
import advancedAi from './advanced-ai';
import legendaryAi from './legendary-ai';
import specialAi from './special-ai';
import huntEvents from './hunt-events';
import resources from './resources';

const monster = {
    options: [
        {
            id: 'prologue',
            move: 6,
            toughness: 6,
            speed: 0,
            damage: 0,
            ai: [],
        },

        {
            id: 'level-1',
            move: 6,
            toughness: 8,
            speed: 0,
            damage: 0,
            decks: {
                ai: getAiCards(7, 3),
                aiDiscard: [],
                hl: getRandomCardsFromDeck(hitLocations),
                hlDiscard: [],
                free: [],
                wounds: [],
            },
        },

        {
            id: 'level-2',
            move: 7,
            toughness: 10,
            speed: 1,
            damage: 1,
            ai: getAiCards(7, 3),
            hl: hitLocations,
            traits: ['cunning'],
        },
    ],
};

export function getMonsterCards(id) {
    return monster.options.find(m => m.id === id);
}

function getAiCards(basic = 0, advanced = 0, legendary = 0) {
    const ai = [
        ...getRandomCardsFromDeck(basicAi, basic),
        ...getRandomCardsFromDeck(advancedAi, advanced),
        ...getRandomCardsFromDeck(legendaryAi, legendary),
    ];
    return ai;
}
