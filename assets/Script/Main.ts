import Adaptation, { AdaptType } from "./Adaptation";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Prefab) pp:cc.Prefab = null;

    onLoad() {
        cc.find('Canvas').getComponent(cc.Canvas).fitHeight = true;
        cc.find('Canvas').getComponent(cc.Canvas).fitWidth = true;

        if(!cc.find('Canvas').getComponent(Adaptation)) {
            let adapt = cc.find('Canvas').addComponent(Adaptation);
            adapt.sceneName = 'Main';
            adapt.refresh();
        }

        for(let i=0;i<this.node.getChildByName('btns').children.length;i++) {
            let btn = this.node.getChildByName('btns').children[i];
            btn.on('click', ()=>{
                this.btn();
            })
        }
    }

    btn() {
        this.node.addChild(cc.instantiate(this.pp));
    }
}
