export default class SystemScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SystemScene', active: true });
    }

    create() {
        console.log("SystemScene: 起動・イベント監視開始");
        
        this.events.on('request-overlay', (data) => {
            const gameScene = this.scene.get('GameScene');
            const charaDefs = gameScene.sys.isActive() ? gameScene.charaDefs : this.sys.registry.get('charaDefs');
            
            this.scene.get(data.from).input.enabled = false;
            
            this.scene.launch('NovelOverlayScene', { 
                scenario: data.scenario,
                charaDefs: charaDefs,
                returnTo: data.from
            });
        });
        
        this.events.on('end-overlay', (data) => {
            const returnScene = this.scene.get(data.returnTo);
            if (returnScene && returnScene.sys.isActive()) {
                returnScene.input.enabled = true;
            }
            this.scene.stop(data.from);
        });

        this.events.on('return-to-novel', (data) => {
            if (data.from && this.scene.isActive(data.from)) {
                this.scene.stop(data.from);
            }
            this.scene.start('GameScene', {
                charaDefs: this.sys.registry.get('charaDefs'),
                returnParams: data.params
            });
            this.scene.launch('UIScene');
        });
    }
}