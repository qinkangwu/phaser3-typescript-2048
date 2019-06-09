import { ConsValue } from '../constant';
import { tileInterface } from '../interface';

export class LoadScene extends Phaser.Scene {
    private progressText : Phaser.GameObjects.Text;
    private tileArray : Array<Array<tileInterface>> = [];
    private tileGroup : Phaser.GameObjects.Group;
    private movingTiles : number;
    private canMove : boolean = false;
    private score:number = 0; // 分数
    private bestScore:number = localStorage.getItem(ConsValue.LOCAL_STORAGE_NAME) == null ? 0 : +localStorage.getItem(ConsValue.LOCAL_STORAGE_NAME); // 最高分数
    private scoreText : Phaser.GameObjects.Text;
    private bestScoreText : Phaser.GameObjects.Text;
    private moveSound : Phaser.Sound.BaseSound;
    private growSound : Phaser.Sound.BaseSound;

    constructor() {
      super({
        key: "LoadScene"
      });
    }
  
    init(/*params: any*/): void {
    }
  
    preload(): void {
        // 默认方块
        this.load.image('tile_default', 'assets/sprites/tile_default.png');

        // 重新开始游戏按钮
        this.load.image('restart', 'assets/sprites/restart.png');

        // 分数背景
        this.load.image('score', 'assets/sprites/score.png');

        // 最高分数背景
        this.load.image('score_best', 'assets/sprites/score_best.png');

        // 数值方块
        this.load.spritesheet('tiles', 'assets/sprites/tiles.png', {
            frameWidth: +ConsValue.TILE_SIZE,
            frameHeight: +ConsValue.TILE_SIZE
        })

        this.load.audio("move", ["assets/sounds/move.ogg", "assets/sounds/move.mp3"]);
        this.load.audio("grow", ["assets/sounds/grow.ogg", "assets/sounds/grow.mp3"]);
        
    }
  
    create(): void {
        this.layout();

        this.addTile();
        this.addTile();

        this.addEvent();

        this.addSound();

        console.log(this.children);
    }
  
    update(time: number): void {
        //console.log(this.load.progress);
    }

    private addSound ():void{
        this.moveSound = this.sound.add("move");
        this.growSound = this.sound.add("grow");
    }

    private layout() : void{
        this.layoutHeader();
        this.layoutBody();
    }

    private layoutHeader () : void{
        // 添加分数背景
        this.add.sprite(this.setPosition(0, ConsValue.COL) + 30, this.setPosition(0, ConsValue.ROW) - 100, 'score');

        // 添加最高分数背景
        this.add.sprite(this.setPosition(1, ConsValue.COL) + 40, this.setPosition(0, ConsValue.ROW) - 100, 'score_best');

        // 重新开始游戏
        this.add.sprite(this.setPosition(3, ConsValue.COL) - 10, this.setPosition(0, ConsValue.ROW) - 87, "restart");

         // 分数 
        this.scoreText = this.add.text(this.setPosition(0, ConsValue.COL) + 30, this.setPosition(0, ConsValue.ROW) - 90, '0', { fontFamily: 'Arial', fontSize: 22, fill: '#ffffff' }).setOrigin(.5);

        // 最高分数
        this.bestScoreText = this.add.text(this.setPosition(1, ConsValue.COL) + 40, this.setPosition(0, ConsValue.ROW) - 90, this.bestScore + '', { fontFamily: 'Arial', fontSize: 22, fill: '#ffffff' }).setOrigin(.5);

        let restartButton = this.add.sprite(this.setPosition(3, ConsValue.COL) - 10, this.setPosition(0, ConsValue.ROW) - 87, "restart");
        restartButton.setInteractive();
        restartButton.on("pointerdown", () => {
            this.scene.start("PlayScene");
        })
    }

    private layoutBody() : void{
        this.tileGroup = this.add.group();

        for (let i = 0; i < 4; i++) {
            this.tileArray[i] = [];
            for (let j = 0; j < 4; j++) {
                this.add.sprite(
                    this.setPosition(j , ConsValue.COL),
                    this.setPosition(i , ConsValue.ROW),
                    'tile_default'
                );

                let tile = this.add.sprite(
                    this.setPosition(j, ConsValue.COL),
                    this.setPosition(i, ConsValue.ROW),
                    'tiles'
                );

                tile.alpha = 0; // 设置数值精灵透明度为 0， 隐藏起来
                tile.visible = false; // 设置数值精灵不可见

                this.tileArray[i][j] = {
                    tileValue: 0,
                    tileSprite: tile,
                    canUpgrade: true
                }

                this.tileGroup.add(tile);

            }
        }
    }

    private setPosition(pos : number , direction : number) : number{
        let top = direction === ConsValue.ROW ? 100 : 0;
        //console.log({pos,tileSize : ConsValue.TILE_SIZE,tile_spacing :  ConsValue.TILE_SPACING, top,direction,total : pos * (ConsValue.TILE_SIZE + ConsValue.TILE_SPACING ) + ConsValue.TILE_SIZE * .5 + ConsValue.TILE_SPACING + top})

        return pos * (ConsValue.TILE_SIZE + ConsValue.TILE_SPACING ) + ConsValue.TILE_SIZE * .5 + ConsValue.TILE_SPACING + top;
    }

    private addTile():void{
        // 筛选出空数值区域
        let emptyTiles:Array<object> = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.tileArray[i][j].tileValue === 0) {
                    emptyTiles.push({
                        row: i,
                        col: j
                    })
                }
            }
        }

        if(emptyTiles.length > 0){
            // 从空数值区域随机取一个方块位置
            let chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);

            this.tileArray[chosenTile.row][chosenTile.col].tileValue = 1;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
            this.tileArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);

             // 渐变显示出来
            this.tweens.add({
                targets: [this.tileArray[chosenTile.row][chosenTile.col].tileSprite],
                alpha: 1,
                duration: ConsValue.TWEEN_DURATION,
                onCompolete: () => {
                    this.canMove = true;
                }
            });
        }
        
    }

    private addEvent ():void{
        // 移动端操作
        this.input.on("pointerup", this.handleTouch);
        //this.input.keyboard.on("keydown", this.handleKey);
    }

    private handleKey = (e:KeyboardEvent):void=>{
        if(!this.canMove) return;
        let children:Array<Phaser.GameObjects.Sprite> = this.tileGroup.getChildren();
        switch (e.code) {
            case "KeyA":
            case "ArrowLeft":
            for (var i = 0; i < children.length; i++) {

                // 越向右层级越高
                children[i].depth = children[i].x;
            }
            console.log('向左')
            break;
            case "KeyD":
            case "ArrowRight":
            for (var i = 0; i < children.length; i++) {

                // 设置层级，越左侧层级越高
                children[i].depth = phaserGame.config.width - children[i].x;
            }
            console.log('向右')
            break;
            case "KeyW":
            case "ArrowUp":
            for (var i = 0; i < children.length; i++) {

                // 越下面层级越高
                children[i].depth = children[i].y;
            }
            console.log('向上')
            break;
            case "KeyS":
            case "ArrowDown":
            for (var i = 0; i < children.length; i++) {

                // 越上面层级越高
                children[i].depth = phaserGame.config.height - children[i].y;
            }
            console.log('向下')
            break;
        }
        
    }

    private handleTouch = (e:Phaser.Input.Pointer):void => {
        if(!this.canMove) return;
        // 计算按住时间
        let swipeTime = e.upTime - e.downTime;
        
        // 生成 {x: v1, y: v2} 格式
        let swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        let swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        let swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);

        if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > .8 || Math.abs(swipeNormal.x) > .8)) {
            let children:Array<Phaser.GameObjects.Sprite> = this.tileGroup.getChildren();

            if (swipeNormal.x > .8) {
                for (var i = 0; i < children.length; i++) {

                    // 设置层级，越左侧层级越高
                    children[i].depth = phaserGame.config.width - children[i].x;
                }
                this.move(0, 1);
                console.log('向右')
            }
      
            if (swipeNormal.x < -.8) {
                for (var i = 0; i < children.length; i++) {

                    // 越向右层级越高
                    children[i].depth = children[i].x;
                }
                this.move(0, -1);
                console.log('向左')
            }
      
            if (swipeNormal.y > .8) {
                for (var i = 0; i < children.length; i++) {

                    // 越上面层级越高
                    children[i].depth = phaserGame.config.height - children[i].y;
                }
                this.move(1, 0);
                console.log('向下')
            }
      
            if (swipeNormal.y < -.8) {
                for (var i = 0; i < children.length; i++) {

                    // 越下面层级越高
                    children[i].depth = children[i].y;
                }
                this.move(-1, 0);
                console.log('向上')
            }
        }
    }

    private move(rowStep:number,colStep:number):void{
        this.canMove = false;
        let somethingMoved:boolean = false;
        let moveScore:number = 0;

        this.movingTiles = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let row = rowStep === 1 ? (3 - i) : i;
                let col = colStep === 1 ? (3 - j) : j;

                let tileValue:number = this.tileArray[row][col].tileValue;
                if (tileValue !== 0) {

                     // 横向移动单位距离
                    let rowSteps = rowStep;

                    // 纵向移动单位距离
                    let colSteps = colStep;

                    // 条件一：靠边移动，不可超出
                    // 条件二：移动的地方没有数值方块
                    while (this.isInsideBoard(row + rowSteps, col + colSteps) && this.tileArray[row + rowSteps][col + colSteps].tileValue === 0) {
                        colSteps += colStep;
                        rowSteps += rowStep;
                    }

                    // 条件一：靠边移动，不可超出
                    // 条件二：目标方块与当前方块 tileValue 相等，也就是数值相等
                    // 条件三：目标方块 canUpgrade 为 true【控制一次只能被覆盖一次】
                    // 条件四：当前方块 canUpgrade 为 true
                    // 条件五：tileValue 小于 12 Math.pow(2,12) 4096，最大 4096
                    if  (this.isInsideBoard(row + rowSteps, col + colSteps) &&
                        (this.tileArray[row + rowSteps][col + colSteps].tileValue === tileValue) &&
                        this.tileArray[row + rowSteps][col + colSteps].canUpgrade &&
                        this.tileArray[row][col].canUpgrade &&
                        tileValue < 12){
                            // 移动分数
                            moveScore += (2 ** this.tileArray[row + rowSteps][col + colSteps].tileValue);

                            somethingMoved = true;
                            // 目标方块 tileValue + 1， 本来是 Math.pow(2,1) 变成了 Math.pow(2,2)，也就是方块 2 变成 4
                            this.tileArray[row + rowSteps][col + colSteps].tileValue++;

                            // 目标块只能被覆盖一次
                            this.tileArray[row + rowSteps][col + colSteps].canUpgrade = false;

                            // 设置当前方块 tileValue 为 0
                            this.tileArray[row][col].tileValue = 0;


                            // 当前方块移动到目标方块
                            // 参数一：当前数值精灵
                            // 参数二：横向位置
                            // 参数三：纵向位置
                            // 参数四：移动单位距离
                            // 参数五： bool
                            this.moveTile(this.tileArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps),true);

                    }else{
                        // while 时最后一次条件不成立，但 colSteps 与 rowSteps 已经加了col与row，所以这里减回去。
                        rowSteps = rowSteps - rowStep;
                        colSteps = colSteps - colStep;

                         // 若横向或纵向有移动，则开始移动
                        if (colSteps !== 0 || rowSteps !== 0) {
                            somethingMoved = true;
                            // console.log(row, rowSteps, col, colSteps)
                            // 设置移动到的地方值为当前值
                            this.tileArray[row + rowSteps][col + colSteps].tileValue = tileValue;

                            // 设置当前块的值为 0
                            this.tileArray[row][col].tileValue = 0;

                            // 移动方块，在下面操作
                            // 参数一：精灵
                            // 参数二：横向位置
                            // 参数三：纵向位置
                            // 参数四：移动单位距离
                            // 参数五： bool
                            this.moveTile(this.tileArray[row][col], row + rowSteps, col + colSteps, Math.abs(rowSteps + colSteps),false);
                        }
                    }

                }


            }
        }
        if (!somethingMoved) {
            this.canMove = true;
          } else {
            this.moveSound.play();
            this.score += moveScore;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem(ConsValue.LOCAL_STORAGE_NAME, this.bestScore + '');
            }
        }
    }

    private moveTile(tile : tileInterface , row : number , col : number , distance : number , changeNumber? : boolean){
        this.movingTiles++ ;
        this.tweens.add({
            targets: [tile.tileSprite],
            x: this.setPosition(col, ConsValue.COL),
            y: this.setPosition(row, ConsValue.ROW),
            duration: ConsValue.TWEEN_DURATION * distance,
            onComplete : ()=>{
                this.movingTiles--;
                if (changeNumber) {
                    this.transformTile(tile, row, col);
                }
                if (this.movingTiles === 0) {
                    this.scoreText.setText(this.score + '');
                    this.bestScoreText.setText(this.bestScore + '');
                    this.resetTiles();
                    this.addTile();
                }
            }
        })
    }

    private isInsideBoard(row:number, col:number):boolean {
        return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
    }

    private resetTiles() : void{
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              this.tileArray[i][j].canUpgrade = true;
              this.tileArray[i][j].tileSprite.x = this.setPosition(j, ConsValue.COL);
              this.tileArray[i][j].tileSprite.y = this.setPosition(i, ConsValue.ROW);
              if (this.tileArray[i][j].tileValue > 0) {
                this.tileArray[i][j].tileSprite.alpha = 1;
                this.tileArray[i][j].tileSprite.visible = true;
      
                // 假如 tileValue = 2，则方块数值为 Math.pow(2,2) == 4, 4 的精灵索引为1，所以等于 tileValue - 1
                console.log(this.tileArray[i][j].tileValue - 1);
                this.tileArray[i][j].tileSprite.setFrame(this.tileArray[i][j].tileValue - 1);
              } else {
                this.tileArray[i][j].tileSprite.alpha = 0;
                this.tileArray[i][j].tileSprite.visible = false;
              }
            }
        }
    }

    private transformTile(tile:tileInterface , row : number, col : number) : void{
        this.growSound.play();
        this.movingTiles++;
        tile.tileSprite.setFrame(this.tileArray[row][col].tileValue - 1);
        this.tweens.add({
            targets: [tile.tileSprite],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: ConsValue.TWEEN_DURATION,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.movingTiles--;
                if (this.movingTiles === 0) {
                    this.scoreText.setText(this.score + '');
                    this.bestScoreText.setText(this.bestScore + '');
                    this.resetTiles();
                    this.addTile();
                }
            }
        })
    }
    
  };