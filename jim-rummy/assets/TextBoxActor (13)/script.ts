class TextBoxMouseIconActorBehavior extends Sup.Behavior {
  stepCount:number = 0;
  isAnimated:boolean = false;
  
  awake() {
    new Sup.SpriteRenderer(this.actor, "MouseIcon");
    this.actor.setPosition(1.85, 1.35, 4.45);
  }
  
  update() {
    if (this.isAnimated) {
      this.stepCount++;
    }
    this.actor.spriteRenderer.setOpacity(Math.floor(this.stepCount / 20) % 2);
  }
  
  playAnimation() {
    this.isAnimated = true;
  }
  
  stopAnimation() {
    this.isAnimated = false;
    this.stepCount = 0;
  }
}
Sup.registerBehavior(TextBoxMouseIconActorBehavior);

class TextBoxJimIconActorBehavior extends Sup.Behavior {
  awake() {
  }
}
Sup.registerBehavior(TextBoxJimIconActorBehavior);

class TextBoxBackgroundActorBehavior extends Sup.Behavior {
  mouseIcon:TextBoxMouseIconActorBehavior;
  
  awake() {
    new Sup.SpriteRenderer(this.actor, "TextBoxSprite");
    this.actor.setPosition(-2, 2.2, 4.4);
    let mouseIconActor = new Sup.Actor("mouseIcon");
    mouseIconActor.addBehavior(TextBoxMouseIconActorBehavior);
    this.mouseIcon = mouseIconActor.getBehavior(TextBoxMouseIconActorBehavior);
  }
  
  playAnimation() {
    this.mouseIcon.playAnimation();
  }
  
  stopAnimation() {
    this.mouseIcon.stopAnimation();
  }
  
  isPlayingAnimation() {
    return this.mouseIcon.isAnimated;
  }
}
Sup.registerBehavior(TextBoxBackgroundActorBehavior);

class TextBoxActorBehavior extends Sup.Behavior {
  
  messages:Array<string>;
  messageIndex:number = 0;
  numLetters:number = 0;
  background:Sup.Actor;
  jimIcon:Sup.Actor;
  
  awake() {
    this.background = new Sup.Actor("text box background");
    this.background.addBehavior(TextBoxBackgroundActorBehavior);
    new Sup.TextRenderer(this.actor, "", "MessageFont");
    this.actor.setPosition(-1.85, 2.2, 4.5);
    this.actor.textRenderer.setAlignment("left");
    this.actor.textRenderer.setVerticalAlignment("top");
    
    let messagesWithLineBreaks:Array<string> = [];
    for (let messageIdx = 0; messageIdx < this.messages.length; messageIdx++) {
      if (messageIdx % 2 == 0) {
        let message = this.messages[messageIdx]
        let messageLines:Array<string> = [];
        while (message.length > 37) {
          let i = 37;
          while (message.charAt(i) != ' ') {
            i--;
          }
          messageLines.push(message.slice(0, i));
          message = message.slice(i + 1, message.length);
        }
        messageLines.push(message);

        let messageWithLineBreaks = "";
        for (let messageLine of messageLines) {
          messageWithLineBreaks = messageWithLineBreaks + messageLine + "\r\n";
        }
        messagesWithLineBreaks.push(messageWithLineBreaks);
      } else {
        messagesWithLineBreaks.push(this.messages[messageIdx]);
      }
    }
    
    this.messages = messagesWithLineBreaks;
  }

  update() {
    //this.jimIcon.actor.spriteRenderer.setSprite("GameJim");
    //this.jimIcon.actor.spriteRenderer.setAnimation("talk");
    //Sup.log(this.messages[this.messageIndex * 2 + 1]);
    this.jimIcon.spriteRenderer.setAnimation(this.messages[this.messageIndex * 2 + 1]);
    let text = this.messages[this.messageIndex * 2];
    if (this.numLetters < text.length - 1) {
      blip();
      let delta = Sup.Input.isMouseButtonDown(0) ? 2 : 1;
      this.numLetters = Math.min(this.numLetters + delta, text.length - 1);
      this.actor.textRenderer.setText(text.slice(0, this.numLetters));
    } else {
      if (!this.background.getBehavior(TextBoxBackgroundActorBehavior).isPlayingAnimation()) {
        this.background.getBehavior(TextBoxBackgroundActorBehavior).playAnimation();
        this.jimIcon.spriteRenderer.setPlaybackSpeed(0);
        this.jimIcon.spriteRenderer.setAnimationFrameTime(0);
      }
      
      if (Sup.Input.wasMouseButtonJustPressed(0)) {
        this.messageIndex++;
        this.numLetters = 0;
        this.background.getBehavior(TextBoxBackgroundActorBehavior).stopAnimation();
        
        this.jimIcon.spriteRenderer.setPlaybackSpeed(1);
        
        if (this.messageIndex * 2 == this.messages.length) {
          this.jimIcon.destroy();
          this.actor.destroy();
          this.background.getBehavior(TextBoxBackgroundActorBehavior).mouseIcon.actor.destroy();
          this.background.destroy();
        }
      }
    }
  }
}
Sup.registerBehavior(TextBoxActorBehavior);
