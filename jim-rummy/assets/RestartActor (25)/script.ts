class RestartActorBehavior extends Sup.Behavior {
  awake() {
    new Sup.SpriteRenderer(this.actor, "Restart");
  }

  update() {
    if (Sup.Input.wasMouseButtonJustReleased(0)) {
      restart();
      this.actor.destroy();
    }
  }
}
Sup.registerBehavior(RestartActorBehavior);
