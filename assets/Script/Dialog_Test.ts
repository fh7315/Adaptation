const {ccclass, property} = cc._decorator;

@ccclass
export default class Dialog_Test extends cc.Component {

    close() {
        this.node.destroy();
    }
}
