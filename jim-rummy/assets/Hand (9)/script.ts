class Hand {
  cards:Array<Sup.Actor>;
  isPlayer:boolean;
  
  constructor(isPlayer:boolean) {
    this.cards = new Array<Sup.Actor>();
    this.isPlayer = isPlayer;
  }
  
  addCard(card:Card, position:Sup.Math.Vector3 = DECK_POSITION) {
    let cardActor = new Sup.Actor(card.toString());
    cardActor.addBehavior(CardActorBehavior, {card: card, hand: this});
    cardActor.setPosition(position);
    this.cards.push(cardActor);
    this.positionCards();
  }
  
  removeCard(card:Card) {
    this.cards = this.cards.filter(function(x) {
      return !x.getBehavior(CardActorBehavior).card.equals(card);
    });
    this.positionCards();
  }
  
  positionCards() {
    const sign = this.isPlayer ? -1 : 1;
    const cardDelta = 0.4;
    this.cards.sort(function(x:Sup.Actor, y:Sup.Actor):number { return x.getBehavior(CardActorBehavior).card.getSpriteIndex() - y.getBehavior(CardActorBehavior).card.getSpriteIndex(); });
    const xOffset = (this.cards.length - 1)/2 * cardDelta;
    for (let i = 0; i < this.cards.length; i++) {
      const offCenterFactor = i - (this.cards.length - 1 )/2;
      moveCard(this.cards[i].getBehavior(CardActorBehavior), new Sup.Math.Vector3(
          i * cardDelta - xOffset,
          0.3 + sign * (1.3 + Math.pow(offCenterFactor, 2) / 40),
          i/52
      ));
      this.cards[i].getBehavior(CardActorBehavior).desiredRotation = sign * offCenterFactor / 16;
    }
  }
}
