class CardActorBehavior extends Sup.Behavior {
  card:Card;
  hand:Hand;
  
  frozen:boolean = false;
  forceBack:boolean = false;
  
  desiredPosition:Sup.Math.Vector3;
  desiredRotation:number;
  
  awake() {
    new Sup.SpriteRenderer(this.actor, "CardFaces");
    this.updateSprite();
    new fMouseInput(this.actor);
    this.actor.fMouseInput.setCameraActorName("Camera Man");
  }

  update() {
    if (this.hand != null && this.hand.isPlayer && playerTurn) {
      let ray = new Sup.Math.Ray();
      ray.setFromCamera(cameraManActor.camera, Sup.Input.getMousePosition());
      let hits = ray.intersectActors(this.hand.cards);
      
      let playerHand = this.hand;

      if (this.actor.fMouseInput.isMouseOver &&
          Sup.Input.wasMouseButtonJustPressed(0) &&
          hits.length >= 1 &&
          hits[0].actor == this.actor && 
          !this.frozen &&
          this.card.canPlayOn(getLastDiscarded()) &&
          Sup.getActor("Shuffler") == null &&
          Sup.getActor("TextBox") == null
       ) {        
        this.play();
        if (playerHand.cards.length == 0 && numTwoCardRestrictions >= 2) {
          sayMessages([
              "Well kid, you bested me. It was a good game all around.", "crossed",
              "I'm going to go see what your mom is up to...", "talk"
          ]);
          doEndGame = true;
        } else {
          deckActor.getBehavior(DeckActorBehavior).takeOpponentTurn();
        }
      }
    }
    
    this.frozen = false;
    
    if (this.desiredPosition != null) {
      this.actor.setZ(this.desiredPosition.z);
      let desiredCopy = new Sup.Math.Vector3(this.desiredPosition.x, this.desiredPosition.y, this.desiredPosition.z);
      let currCopy = new Sup.Math.Vector3(this.actor.getPosition().x, this.actor.getPosition().y, this.actor.getPosition().z);
      let delta = desiredCopy.add(currCopy.multiplyScalar(-1));
      if (Math.abs(delta.length()) < 0.2) {
        this.actor.setPosition(this.desiredPosition);
        this.actor.setLocalEulerZ(this.desiredRotation);
        this.desiredPosition = null;
      } else {
        let speed = delta.length() / 3.0;
        speed = Math.max(speed, 0.05);
        speed = Math.min(speed, 0.5);
        this.actor.move(delta.normalize().multiplyScalar(speed));
      }
    }
  }
    
  play() {    
    if (allowedTwoRankPairs[this.card.rank] == null) {
      allowedTwoRankPairs[this.card.rank] = [getLastDiscarded().rank];
    } else {
      allowedTwoRankPairs[this.card.rank].push(getLastDiscarded());
    }
    
    DISCARD_POSITION.z += 1/52;
    discardPile.push(this.actor);
    moveCard(this, DISCARD_POSITION);
    this.desiredPosition.add(new Sup.Math.Vector3(
      Sup.Math.Random.float(-0.01, 0.01),
      Sup.Math.Random.float(-0.01, 0.01),
      Sup.Math.Random.float(-0.01, 0.01)
    ));

    for (let card of this.hand.cards) {
      card.getBehavior(CardActorBehavior).frozen = true;
    }

    this.hand.removeCard(this.card);
    
    if (drawMode && (this.card.rank == 2 || this.card.rank == 3)) {
      let deck = deckActor.getBehavior(DeckActorBehavior);
      let destHand = null;
      if (this.hand == deck.playerHand) {
        destHand = deck.otherHand;
      } else {
        destHand = deck.playerHand;
      }
      for (let i = 0; i < this.card.rank; i++) {
        if (deck.cards.length == 0) {
          rememberDealHand = destHand;
          rememberDealNumber = this.card.rank - i;
          break;
        }
        destHand.addCard(deck.cards.pop());
      }
    }

    this.hand = null;
    this.updateSprite();
  }
  
  setCard(card: Card) {
    this.card = card;
    this.updateSprite();
  }
  
  setDesiredPosition(position:Sup.Math.Vector3) {
    moveCard(this, position);
  }
  
  updateSprite() {
    if (this.card == null) {
      this.actor.spriteRenderer.setOpacity(0);
    } else {
      this.actor.spriteRenderer.setOpacity(1);
      if ((this.hand == null || this.hand.isPlayer) && !this.forceBack) {
        this.actor.spriteRenderer.setSprite("CardFaces");
        this.actor.spriteRenderer.setAnimation("all");
        this.actor.spriteRenderer.pauseAnimation();
        this.actor.spriteRenderer.setAnimationFrameTime(this.card.getSpriteIndex());
      } else {
        this.actor.spriteRenderer.setSprite("CardBacks");
      }
    }
  }
}
Sup.registerBehavior(CardActorBehavior);