export class PlayScene extends Phaser.Scene {

    constructor() {
      super({
        key: "PlayScene"
      });
    }
  
    init(/*params: any*/): void {
      console.log('qkw');
    }
  
    preload(): void {
      
    }
  
    create(): void {
      //this.add.sprite(100, 100, 'score');
      console.log(this.children)
    }
  
    update(time: number): void {
        
    }
  };