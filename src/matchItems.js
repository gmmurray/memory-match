import { nanoid } from 'nanoid';
import { chunkArray } from './helpers/chunkArray';

const DEFAULT_MATCH_ITEMS = [
    {
        image: './images/flame.png',
    },
    {
        image: './images/cat.png',
    },
    {
        image: './images/computer.png',
    },
    {
        image: './images/ghost.png',
    },
    {
        image: './images/pokeball.png',
    },
    {
        image: './images/lightning.gif',
    },
    {
        image: './images/sun.gif',
    },
    {
        image: './images/pikachu.gif',
    },
];

export class MatchItems {
    constructor(baseItems) {
        this.pairs = 8;
        this.baseItems = baseItems;
        this.fullItems = [];
    }

    setValues() {
        this.baseItems = this.baseItems.map((v, i) => ({ ...v, value: i }));
        return this;
    }

    setIds() {
        this.fullItems = this.fullItems.map(item => ({
            ...item,
            id: nanoid(),
        }));
        return this;
    }

    duplicateItems() {
        this.fullItems = [...this.baseItems, ...this.baseItems];
        return this;
    }

    randomize() {
        this.fullItems.sort(() => 0.5 - Math.random());
        return this;
    }

    static initialize(baseItems = DEFAULT_MATCH_ITEMS) {
        return new MatchItems(baseItems)
            .setValues()
            .duplicateItems()
            .setIds()
            .randomize();
    }

    createRows() {
        return chunkArray(this.fullItems, this.pairs / 2);
    }
}
