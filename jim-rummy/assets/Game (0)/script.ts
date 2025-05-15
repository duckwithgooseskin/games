let cameraManActor = new Sup.Actor("Camera Man");
new Sup.Camera(cameraManActor);
cameraManActor.camera.setOrthographicMode(true);
cameraManActor.camera.setOrthographicScale(5.0);
cameraManActor.setPosition(0, 0, 5);

let DECK_POSITION = new Sup.Math.Vector3(0.4, 0.3, 0);
let DISCARD_POSITION = new Sup.Math.Vector3(-0.4, 0.3, 0);

let discardPile:Array<Sup.Actor> = [];
let playerTurn = true;

function getLastDiscarded():Card {
  return discardPile[discardPile.length - 1].getBehavior(CardActorBehavior).card;
}

let cardSoundPlayer = new Sup.Audio.SoundPlayer("cardMove", 0.05);
function moveCard(card:CardActorBehavior, position:Sup.Math.Vector3) {
  card.desiredPosition = position;
  if (!cardSoundPlayer.isPlaying()) {
    cardSoundPlayer.play();
  }
}

let jimSoundPlayer = new Sup.Audio.SoundPlayer("jimTalk", 0.2);
function blip() {
  if (!jimSoundPlayer.isPlaying()) {
    jimSoundPlayer.play();
  }
}

let bgSoundPlayer = new Sup.Audio.SoundPlayer("bgm", 0.1, { loop: true });

function sayMessages(messages:Array<string>) {    
  let jimIcon = new Sup.Actor("jimIcon");
  new Sup.SpriteRenderer(jimIcon, "GameJim");
  jimIcon.setPosition(1.49, 1.71, 4.45);

  let tb = new Sup.Actor("TextBox");
  tb.addBehavior(TextBoxActorBehavior, { messages: messages, jimIcon: jimIcon });
}

function sayMessagesWithJim(messages:Array<string>, jim:Sup.Actor) {    
  let tb = new Sup.Actor("TextBox");
  tb.addBehavior(TextBoxActorBehavior, { messages: messages, jimIcon: jim });
}

let discardBaseActor, deckActor, backgroundActor;

function startGame() {
  bgSoundPlayer.play();
  
  discardBaseActor = new Sup.Actor("Discard Base");
  discardBaseActor.setPosition(DISCARD_POSITION);

  deckActor = new Sup.Actor("Deck");
  deckActor.addBehavior(DeckActorBehavior, {playerHand: new Hand(true), otherHand: new Hand(false)});
  deckActor.setPosition(DECK_POSITION);

  backgroundActor = new Sup.Actor("Background");
  backgroundActor.setPosition(0,0,-5);
  new Sup.SpriteRenderer(backgroundActor, "bg");

  sayMessages([
      "Alright kid, we're going to play some Gin Rummy.", "talk",
      "... What? You don't know how to play?", "facepalm",
      "Alright, I guess I can teach you...", "crossed",
      "Gin Rummy is pretty straightforward: You just uh...... You gotta get rid of your cards?", "talk",
      "Look kid. Just play a card that matches either the suit or number of the discarded card.", "crossed",
      "If you can't play anything then I guess you can draw.", "talk"
  ]);
}

function endGame() {
  Sup.destroyAllActors();
  bgSoundPlayer.stop();

  cameraManActor = new Sup.Actor("Camera Man");
  new Sup.Camera(cameraManActor);
  cameraManActor.camera.setOrthographicMode(true);
  cameraManActor.camera.setOrthographicScale(5.0);
  cameraManActor.setPosition(0, 0, 5);

  let restart = new Sup.Actor("restarter");
  restart.addBehavior(RestartActorBehavior);
}

let hasExplainedShuffling = false;

let twoRankRestrictions:Object = {};
let allowedTwoRankPairs:Object = {};
let numTwoCardRestrictions = 0;

let wildCard:number = -1;
let trumpPairFirst = -1;
let trumpPairSecond = -1;
let drawMode = false;

let rememberDealHand = null;
let rememberDealNumber = -1;

let didCheat:boolean = false;
let playCounter = 0;
let numExtraPlayCheats = 0;

let doEndGame:boolean = false;

let introActor = new Sup.Actor("introActor");
introActor.addBehavior(IntroActorBehavior);

function restart() {
  discardPile = [];
  playerTurn = true;

  DISCARD_POSITION = new Sup.Math.Vector3(-0.4, 0.3, 0);

  discardBaseActor = null;
  deckActor = null;
  backgroundActor = null;
  
  hasExplainedShuffling = false;

  twoRankRestrictions = {};
  allowedTwoRankPairs = {};
  numTwoCardRestrictions = 0;

  wildCard = -1;
  trumpPairFirst = -1;
  trumpPairSecond = -1;
  drawMode = false;

  rememberDealHand = null;
  rememberDealNumber = -1;

  didCheat = false;
  playCounter = 0;
  numExtraPlayCheats = 0;

  doEndGame = false;

  introActor = new Sup.Actor("introActor");
  introActor.addBehavior(IntroActorBehavior);
}