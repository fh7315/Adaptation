# ccc2.x 适配方案

## 说明

方案初衷是想给已稳定的项目添加一个适配各种分辨率的整体方案，要求对场景、预制、代码逻辑做最小的改动；最好不必修改图片等资源。

## 适配要求

1、ui不可变形，只能做整体拉伸

2、不能有黑边

3、ui上下左右对应自动靠边

4、异形屏旋转后自适应

## 具体方案

### 1、适配规则

    export enum AdaptType {
        None = 0,
        ScaleX = 1,         //拉伸宽度
        ScaleY = 1 << 1,    //拉伸高度
        Left = 1 << 2,      //靠左
        Right = 1 << 3,     //靠右
        Top = 1 << 4,       //靠上
        Bottom = 1 << 5,    //靠下
        ScaleAll = 1 << 6,  //整体缩放
        ScaleBg = 1 << 7,   //整体缩放，铺满全屏，根据图片（节点）尺寸确定缩放比例
        Fit = 1 << 8,       //拉伸宽或高，铺满全屏
    }

### 2、配置文件

录入每个需要适配的场景、预制中每个节点的适配规则

例如：

    /** 各个场景、预制的适配规则 */
    private static _nodeDatas = {
        //scene
        'Main': {
            'bg': AdaptType.ScaleBg,
            'btns/1': AdaptType.Right|AdaptType.Top,
            'btns/2': AdaptType.Right|AdaptType.Top,
            'btns/3': AdaptType.Left,
            'btns/4': AdaptType.Left,
            'btns/5': AdaptType.Bottom,
            'btns/6': AdaptType.Bottom,
            'btns/7': AdaptType.Bottom,
            'btns/8': AdaptType.Right,
            'btns/9': AdaptType.Right,
            'label': AdaptType.Left|AdaptType.Top,
        },
        //Prefab
        'Dialog_Test': {
            'mask': AdaptType.ScaleBg,
            'close': AdaptType.Right|AdaptType.Top,
        },
    }

### 3、获取适配需要的参数

    private static _params:number[] = null;
    /** 适配参数 */
    private static get params():number[] {
        if(!this._params) {
            let w = cc.view.getFrameSize().width; //实际宽度
            let h = cc.view.getFrameSize().height; //实际高度
            let ratio = w/h; //实际宽高比
            let desRatio = 1332/740; //设计宽高比
            let isNotch = cc.sys.isNative && ratio>1432/740; //是否异型屏（简化，实际如果需要，可以在通过原生方法中获取）
            let lsLeft = ratio > desRatio && -((ratio-desRatio)*740/2)+(isNotch?50:0); //左侧修正（简化，默认异形屏尺寸位置50）
            let lsRight = ratio > desRatio && ((ratio-desRatio)*740/2)+(isNotch?-50:0); //右侧修正
            let lsTop = ratio < desRatio ? ((1/ratio-1/desRatio)*1332/2) : 0; //顶部修正
            let lsBottom = ratio < desRatio ? -((1/ratio-1/desRatio)*1332/2) : 0; //底部修正
            this._params = [ratio, desRatio, lsLeft, lsRight, lsTop, lsBottom];
        }
        return this._params;
    }

### 4、适配节点

    /** 适配单个节点 */
    static dealNode(node:cc.Node, type:AdaptType) {
        if(!this.isValid) {
            return;
        }
        let p = this.params;
        let ratio = p[0], desRatio = p[1], lsLeft = p[2], lsRight = p[3], lsTop = p[4], lsBottom = p[5];
        if(!node) {
            return;
        }
        let pos = node.position;
        if(type & AdaptType.ScaleAll) {
            node.scale = ratio > desRatio ? ratio/desRatio : desRatio/ratio;
        }
        else if(type & AdaptType.ScaleBg) {
            let bgRatio = node.width/node.height;
            node.scale = ratio > desRatio ? (bgRatio >= ratio ? 1 : ratio/bgRatio) : (bgRatio >= ratio ? bgRatio/ratio : 1);
        }
        else if(type & AdaptType.Fit) {
            ratio > desRatio ? node.scaleX = ratio/desRatio : node.scaleY = desRatio/ratio;
        }
        if(type & AdaptType.Left) {
            node.x = pos.x + lsLeft;
        }
        if(type & AdaptType.Right) {
            node.x = pos.x + lsRight;
        }
        if(type & AdaptType.Top) {
            node.y = pos.y + lsTop;
        }
        if(type & AdaptType.Bottom) {
            node.y = pos.y + lsBottom;
        }
    }

    /** 初始化适配，手动适配全部节点 */
    refresh() {}

### 5、初始化方式

1、挂在root节点

2、代码添加
    
    onLoad() {
        let adapt = cc.find('Canvas').addComponent(Adaptation);
        adapt.sceneName = 'Main';
        adapt.refresh();
    }

3、如果场景或者预制中需要适配节点不多，也可不录入配置文件，直接在预制的脚本中使用代码控制

    onLoad() {
        Adaptation.dealNode(this.node.getChildByName('bg'), AdaptType.ScaleBg);
    }

### 6、注意事项

使用此方案，务必设置Canvas的适配规则：

    onLoad() {
        cc.find('Canvas').getComponent(cc.Canvas).fitHeight = true;
        cc.find('Canvas').getComponent(cc.Canvas).fitWidth = true;
    }

预制件和场景用法基本一致，可参考项目链接：https://github.com/fh7315/Adaptation