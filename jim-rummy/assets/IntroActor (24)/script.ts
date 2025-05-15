class IntroActorBehavior extends Sup.Behavior {
  bg:Sup.Actor;
  title:Sup.Actor;
  jim:Sup.Actor;
  
  phase:number;
  phaseCount:number;
  
  awake() {
    this.bg = new Sup.Actor("bg");
    new Sup.SpriteRenderer(this.bg, "IntroBg");
    this.bg.setPosition(0,0,-5);
    
    this.title = new Sup.Actor("title");
    new Sup.SpriteRenderer(this.title, "Title");
    this.title.setPosition(0,0,1);
    
    this.jim = new Sup.Actor("jim");
    new Sup.SpriteRenderer(this.jim, "IntroJim");
    this.jim.setPosition(5.4,-0.8,0);
    
    this.phaseCount = 0;
    this.phase = 0;
  }

  update() {
    this.phaseCount++;
    
    if (this.phase == 0) {
      if (Sup.Input.wasMouseButtonJustReleased(0)) {
        this.phase = 1;
        this.phaseCount = 0;
      }
    } else if (this.phase == 1) {
      if (this.phaseCount == 20) {
        this.phase = 2;
        sayMessagesWithJim([
          "Hey kid! It's me. Your Uncle Jim!", "wavyHand",
          "Pretty lame of the adults to leave you all alone over here in the living room, isn't it?", "crossedArms",
          "Well I've got a proposition for you! (I am the \"fun uncle\" after all)", "wavyHand",
          "Why don't we play some cards?", "cards",
          "Come on! I might even go easy on you.", "cards"
        ], this.jim);
      } else {
        this.title.spriteRenderer.setOpacity((20 - this.phaseCount) / 20);
        this.jim.setX(5.4 - this.phaseCount / 5)
      }
    } else if (this.phase == 2) {
      if (Sup.getActor("TextBox") == null) {
        this.deletThis();
      }
    }
    
  }
  
  deletThis() {
      startGame();
      this.actor.destroy();
      this.bg.destroy();
  }
}
Sup.registerBehavior(IntroActorBehavior);
