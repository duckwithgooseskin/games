enum PhaseType {
  cut,
  combine,
  moveToDeck,
  wait,
  done,
  explain
}

class ShufflerBehavior extends Sup.Behavior {
  deck:DeckActorBehavior;
  
  shufflesRemaining:number;
  
  allCards:Array<Sup.Actor>;
  
  cutIndex:number;
  
  phase:PhaseType;
  waitTimer:number;
  nextPhase:PhaseType;
  
  step:number = 0;
  
  awake() {
    this.shufflesRemaining = 2;
    this.allCards = discardPile.slice(0, discardPile.length - 1);
    discardPile = [discardPile[discardPile.length - 1]]
    if (!hasExplainedShuffling) {
      sayMessages(["Hmm... we ran out of cards.", "crossed",
                   "I'll go ahead and shuffle the discard pile.", "talk"
                  ]);
      hasExplainedShuffling = true;
      this.phase = PhaseType.wait;
      this.nextPhase = PhaseType.explain;
      this.waitTimer = 20;
    } else {
      this.phase = PhaseType.cut;
    }
    this.cutIndex = 0;
    this.waitTimer = 0;
  }

  update() {
    if (this.step == 0) {
      switch (this.phase) {
        case PhaseType.explain:
          if (Sup.getActor("TextBox") == null) {
            this.nextPhase = PhaseType.cut;
            this.phase = PhaseType.wait;
            this.waitTimer = 5;
          }
          break;
        case PhaseType.wait:
          this.waitTimer--;
          if (this.waitTimer < 0) {
            this.phase = this.nextPhase;
          }
          break;
        case PhaseType.cut:
          if (this.cutIndex >= this.allCards.length) {
            this.phase = PhaseType.wait;
            this.nextPhase = PhaseType.combine;
            this.waitTimer = 10;
            this.cutIndex = 0;
          } else {
            let card = this.allCards[this.cutIndex];
            let position;
            if (Sup.Math.Random.integer(0, 1) == 0) {
              position = new Sup.Math.Vector3(1.4, 0.3, card.getZ());
            } else {
              position = new Sup.Math.Vector3(2.4, 0.3, card.getZ());
            }
            let cardBehavior = card.getBehavior(CardActorBehavior);
            cardBehavior.forceBack = true;
            cardBehavior.updateSprite();
            moveCard(cardBehavior, position);
            cardBehavior.desiredRotation = 0;
            this.cutIndex++;
          }
          break;
        case PhaseType.combine:
          if (this.cutIndex >= this.allCards.length) {
            this.phase = PhaseType.wait;
            this.nextPhase = PhaseType.moveToDeck;
            this.waitTimer = 20;
          } else {
            let card = this.allCards[this.cutIndex];
            moveCard(card.getBehavior(CardActorBehavior), new Sup.Math.Vector3(1.9, 0.3, card.getZ()));
            this.cutIndex++;
          }
          break;
        case PhaseType.moveToDeck:
          for (let card of this.allCards) {
            card.getBehavior(CardActorBehavior).desiredPosition = new Sup.Math.Vector3(0.4, 0.3, card.getZ());
          }
          this.phase = PhaseType.wait;
          this.nextPhase = PhaseType.done;
          this.waitTimer = 5;
          break;
        case PhaseType.done:
          this.deck.cards = this.allCards.map(function(x) {
            let retCard = x.getBehavior(CardActorBehavior).card;
            x.destroy();
            return retCard;
          });

          if (!playerTurn) {
            this.deck.takeOpponentTurn();
          }
          
          for (let i = 0; i < rememberDealNumber; i++) {
            rememberDealHand.addCard(deckActor.getBehavior(DeckActorBehavior).cards.pop());
          }

          this.deck.actor.spriteRenderer.setOpacity(1);
          this.actor.destroy();
          break;
      }
    }
    
    //this.step = (this.step + 1) % 2;
  }
}
Sup.registerBehavior(ShufflerBehavior);