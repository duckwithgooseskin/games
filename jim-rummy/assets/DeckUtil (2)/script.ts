enum Suit {
  Clubs,
  Diamonds,
  Spades,
  Hearts
}

let ALL_SUITS = [Suit.Diamonds, Suit.Hearts, Suit.Spades, Suit.Clubs]

class Card {
  suit:Suit;
  rank:number;
  
  constructor(suit:Suit, rank:number) {
    this.suit = suit;
    this.rank = rank;
  }
  
  getSpriteIndex() {
    return this.suit * 13 + this.rank - 1;
  }
  
  equals(other:Card): boolean {
    return this.suit == other.suit && this.rank == other.rank;
  }
  
  canPlayOn(other:Card): boolean {    
    return (this.suit == other.suit || this.rank == other.rank || this.rank == wildCard) && 
       twoRankRestrictions[other.rank] != this.rank;
  }
}

function getAllCards():Array<Card> {
  let cards = new Array<Card>();
  for (let i = 1; i <= 13; i++) {
    for (let suit of ALL_SUITS) {
      cards.push(new Card(suit, i));
    }
  }
  return cards;
}

function getRankName(rank:number, includeIndefiniteArticle:boolean):string {
  let result:string = "";
  if (includeIndefiniteArticle) {
    if (rank == 1 || rank == 8) {
      result = "an ";
    } else {
      result = "a ";
    }
  }
  
  switch (rank) {
    case 1:
      return result + "ace";
    case 11:
      return result + "jack";
    case 12:
      return result + "queen";
    case 13:
      return result + "king";
    default:
      return result + rank;
  }
}
  
function shuffle(cards:Array<Card>) {
  if (cards.length > 1) {
    for (let i = 0; i < cards.length; i++) {
      const randomChoiceIndex = Math.floor(Math.random() * (cards.length - 1 - i)) + i;
      [cards[i], cards[randomChoiceIndex]] = [cards[randomChoiceIndex], cards[i]];
    }
  }
}