class DeckActorBehavior extends Sup.Behavior {
  cards:Array<Card>;
  playerHand:Hand;
  otherHand:Hand;
  
  opponentTurnTimer:number;
  
  awake() {
    this.cards = getAllCards();
    shuffle(this.cards);
    new Sup.SpriteRenderer(this.actor, "CardBacks");
    new fMouseInput(this.actor);
    this.actor.fMouseInput.setCameraActorName("Camera Man");
    
    for (let i = 0; i < 8; i++) {
      this.draw(this.otherHand);
      this.draw(this.playerHand);
    }
    
    discardBaseActor.addBehavior(CardActorBehavior, {card: this.cards.pop()});
    discardPile.push(discardBaseActor);
  }

  update() {
    if (doEndGame && Sup.getActor("TextBox") == null) {
      endGame();
    }
    
    if (this.cards.length == 0) {
      this.actor.spriteRenderer.setOpacity(0);
    } else {
      this.actor.spriteRenderer.setOpacity(1);
    }
    
    if (this.actor.fMouseInput.isMouseOver && playerTurn && Sup.getActor("TextBox") == null) {
      let doDraw = true;
      if (Sup.Input.wasMouseButtonJustPressed(0)) {
        if (this.playerHand.cards.length > 25) {
          for (let card of this.playerHand.cards) {
            if (card.getBehavior(CardActorBehavior).card.canPlayOn(getLastDiscarded())) {
              sayMessages([
                "Hey kid! Quit drawing and play a card already.", "angry"
              ]);
              doDraw = false;
              break;
            }
          }
        }
        if (doDraw) {
          this.draw(this.playerHand);
          this.takeOpponentTurn();
        }
      }
    }
    
    if (this.cards.length == 0 && Sup.getActor("TextBox") == null) {
      if (Sup.getActor("Shuffler") == null) {
        let shuffler = new Sup.Actor("Shuffler");
        shuffler.addBehavior(ShufflerBehavior,  { deck: this });
      }
    }
    
    if (this.opponentTurnTimer >= 0) {
      this.opponentTurnTimer--;
      if (this.opponentTurnTimer == 0) {
        this.doActualOpponentTurn();
        if (!didCheat) {
          if (this.otherHand.cards.length == 0) {
            sayMessages([
              "Well kid, looks like I won. It was a good game all around.", "crossed",
              "I'm going to go see what your mom is up to...", "talk"
            ]);
            doEndGame = true;
          } else {
            switch(playCounter) {
              case 4:
                sayMessages([
                  "Hey kid, this is pretty fun... right?", "talk",
                  "I mean, sure... I COULD be over the dining room drinking with my brothers and your mom.", "angry",
                  "BUT THIS IS... fun.", "talk"
                ]);
                break;
              case 6:
                sayMessages([
                  "Well, TECHNICALLY I'm not supposed to be over there, and we all know your goody-two-shoes dad isn't going to let me bend the rules at all.", "crossed"
                ]);
                break;
              case 10:
                sayMessages([
                  "Alright kid, let's up the ante. I have a little variant of Gin Rummy that I like to call \"Jim Rummy.\"", "crossed",
                  "Whenever someone plays a 2, the other player has to draw two cards. Whenever someone plays a 3, they draw three.", "talk",
                  "Think you can handle that, small fry? Of course you can.", "talk"
                ]);
                drawMode = true;
                break;
              case 20:
                sayMessages([
                  "Hey, kid... I saw you were watching those Japanese Cartoons on the TV before this.", "talk",
                  "Shouldn't a kid your age be watching SPORTS?", "crossed"
                ]);
                break;
              case 28:
                sayMessages([
                  "You know, when I was your age I was sneaking beers out of your granddad's fridge and drinking them with my buddies.", "crossed",
                  "You do anything like that? No? Why not start?", "crossed",
                  "No but seriously, could you sneak me a beer out of the kitchen?", "talk"
                ]);
                break;
              case 29:
                sayMessages([
                  "Ah, forget about the beer... I don't need it.", "facepalm"
                ]);
                break;
              case 36:
                sayMessages([
                  "Kid, you think they're talking about me in the other room? Seems to be the new fad among them...", "talk",
                  "I don't understand why I'm so popular all of a sudden.", "crossed",
                  "They could ignore me my whole life and then I go to a few lousy AA meetings and suddenly I'm the TALK OF THE TOWN.", "angry"
                ]);
                break;
              case 41:
                sayMessages([
                  "You probably noticed that your Aunt Lisa didn't show up today.", "talk",
                  "We're uh... \"separated\" at the moment.", "facepalm",
                  "Ah, what am I going on about, kid like you doesn't care.", "crossed"
                ]);
                break;
              case 42:
                sayMessages([
                  "Ugh, I don't even know why I come to these holidays anymore. Maybe Lisa's got it right.", "facepalm"
                ]);
                break;
              default:
                break;
            }
          }
        }
      }
    }
  }
  
  draw(hand:Hand) {
    if (drawMode == true && hand == this.otherHand) {
      for (let i = 0; i < this.cards.length; i++) {
        let card = this.cards[i];
        if (card.rank == 2 || card.rank == 3) {
          hand.addCard(card);
          this.cards.splice(i, 1);
          return;
        }
      }
    }
    hand.addCard(this.cards.pop());
  }
  
  takeOpponentTurn() {
    playerTurn = false;
    
    if (this.cards.length != 0) {
      this.opponentTurnTimer = 12;
    }
  }
  
  doActualOpponentTurn() {
    didCheat = true;
    
    if (discardPile.length > 1 && numTwoCardRestrictions < 2) {
      let firstRank = discardPile[discardPile.length - 2].getBehavior(CardActorBehavior).card.rank;
      let secondRank = getLastDiscarded().rank;
      if (this.playerHand.cards.length <= 2 &&
          twoRankRestrictions[firstRank] == null &&
          twoRankRestrictions[secondRank] == null &&
          allowedTwoRankPairs[secondRank].indexOf(firstRank) == -1
         ) {
        
        let secondMessage = "";
        if (numTwoCardRestrictions == 0) {
          secondMessage = "You really haven't played Gin Rummy before, have you...";
        } else {
          let otherRestriction = {};
          for (let i = 1; i <= 13; i++) {
            if (twoRankRestrictions[i] != null) {
              otherRestriction[0] = i;
              otherRestriction[1] = twoRankRestrictions[i];
              break;
            }
          }
          secondMessage = "Look, these are the two restrictions in Gin Rummy: You can't play "
            + getRankName(otherRestriction[1], true) + " on " + getRankName(otherRestriction[0], true)
            + " or " + getRankName(secondRank, true) + " on " + getRankName(firstRank, true);
        }

        twoRankRestrictions[firstRank] = secondRank;
        numTwoCardRestrictions++;
        
        sayMessages([
          "Hey kid! you can't play " + getRankName(secondRank, true) + " on " + getRankName(firstRank, true) + ".", "angry",
          secondMessage, "facepalm"
        ]);
        let card = discardPile.pop();
        this.playerHand.addCard(card.getBehavior(CardActorBehavior).card, DISCARD_POSITION);
        card.destroy();
        playerTurn = true;
        return;
      }
    }
    
    if (playCounter < 50 && this.otherHand.cards.length == 1) {
      this.draw(this.otherHand);
      playerTurn = true;
      playCounter++;
      didCheat = false;
      return;
    }
    
    for (let card of this.otherHand.cards) {
      let cardBehavior = card.getBehavior(CardActorBehavior);
      if (cardBehavior.card.canPlayOn(getLastDiscarded())) {
        cardBehavior.play();
        playerTurn = true;
        playCounter++;
        didCheat = false;
        return;
      }
    }
    
    if (Sup.Math.Random.integer(15, 65) < playCounter && this.otherHand.cards.length >= 2) {
      let cardBehavior = this.otherHand.cards[0].getBehavior(CardActorBehavior);
      let card = cardBehavior.card;
      switch (numExtraPlayCheats) {
        case 0:
          sayMessages([
            "Oh right... I forgot to mention this, but " + getRankName(card.rank, false) + "s are wild.", "talk",
            "You can play them on top of any card.", "talk",
            "This is just how it the real world works, kid. You don't always know what to expect.", "crossed",
            "One time in the 10th grade Rick- I mean your dad- he asked this girl to the prom.", "crossed",
            "She said yes but here's the thing: I was going to ask that girl to the prom.", "facepalm",
            "I just hadn't got around to it yet! What a jerk...", "angry",
            "You just never know what life's going to throw at you.", "angry",
            "So yeah, " + getRankName(card.rank, false) + "s are wild.", "talk"
          ]);
          wildCard = card.rank;
          cardBehavior.play();
          playerTurn = true;
          numExtraPlayCheats++;
          return;
        case 1:
          sayMessages([
            "Okay, so I didn't tell you this rule at first because I thought you might be too young to understand.", "talk",
            "This game has the concept of \"Trump Cards.\" Specifically \"Trump Pairs\".", "talk",
            "So one of these pairs is " + getRankName(card.rank, false) + "s and " + getRankName(getLastDiscarded().rank, false) + "s.", "talk",
            "Which means that you can play a " + getRankName(card.rank, false) + " on a " + getRankName(getLastDiscarded().rank, false) + ", even if they're different suits", "talk"
          ])
          trumpPairFirst = getLastDiscarded().rank;
          trumpPairSecond = card.rank;
          cardBehavior.play();
          playerTurn = true;
          numExtraPlayCheats++;
          return;
        default:
          break;
      }
    }

    this.draw(this.otherHand);
    playerTurn = true;
    playCounter++;
    didCheat = false;
  }
}
Sup.registerBehavior(DeckActorBehavior);
