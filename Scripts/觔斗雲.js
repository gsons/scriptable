// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: comments;
// 
// iOS 桌面组件脚本 @「小件件」
// 开发说明：请从 Widget 类开始编写，注释请勿修改
// https://x.im3x.cn
// 


// 添加require，是为了vscode中可以正确引入包，以获得自动补全等功能
if (typeof require === 'undefined') require = importModule
const { Base } = require("./「小件件」开发环境")

// @组件代码开始
class Widget extends Base {


    /**
     * 传递给组件的参数，可以是桌面 Parameter 数据，也可以是外部如 URLScheme 等传递的数据
     * @param {string} arg 自定义参数
     */
    constructor(arg) {
        super(arg)
        this.name = '觔斗雲'
        this.desc = '觔斗雲流量監控'
    }

    /**
     * 渲染函数，函数名固定
     * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
     */
    async render() {
        const data = await this.getData()
        switch (this.widgetFamily) {
            case 'large':
                return await this.renderLarge(data)
            case 'medium':
                return await this.renderMedium(data)
            default:
                return await this.renderSmall(data)
        }
    }


    getDays() {
        var curDate = new Date();
        var curMonth = curDate.getMonth(); //当前月份 需要加1
        curDate.setMonth(curMonth + 1);
        curDate.setDate(0)
        curDate.getDate();
        return curDate.getDate() - new Date().getDate() + 1;
    }
    /**
     * 渲染小尺寸组件
     */
    async renderSmall(data) {
        let w = new ListWidget()
        w.backgroundColor = new Color("#aeaa33");
        var data = await this.getData();
        data=data.data

        const tt2 = w.addText(`               觔斗雲\n`);
        tt2.textColor = new Color("#aa553a")
        tt2.font = Font.boldSystemFont(12)

        const tt = w.addText(`剩余流量 ${data.remain_flow}`);
        tt.textColor = new Color("#aa553a")
        tt.font = Font.boldSystemFont(12)

        const tt4 = w.addText(`今日流量${data.used_flow}`);
        tt4.textColor = new Color("#aa553a")
        tt4.font = Font.boldSystemFont(12)

        const tt0 = w.addText(`\n在线用户 ${data.online} / ${data.sum}`);
        tt0.textColor = new Color("#fff")
        tt0.font = Font.boldSystemFont(12)

        const tt1 = w.addText(`余额 ${data.momey}  佣金 ${data.commission}`);
        tt1.textColor = new Color("#fff")
        tt1.font = Font.boldSystemFont(12)

        const tt3 = w.addText("时间 " + data.last_used_date);
        tt3.textColor = new Color("#fff")
        tt3.font = Font.boldSystemFont(12)
        return w
    }
    /**
     * 渲染中尺寸组件
     */
    async renderMedium(data, num = 3) {
        let w = new ListWidget()
        return w
    }
    /**
     * 渲染大尺寸组件
     */
    async renderLarge(data) {
        return await this.renderMedium(data, 10)
    }

    /**
     * 获取数据函数，函数名可不固定
     */
    async getData() {
        const api = 'http://somersaultcloud.json'
        return await this.httpGet(api, true, false)
    }

    getwidget(w, width, h, total, haveGone, str) {
        const titlew = w.addText(str)
        titlew.textColor = new Color("#e587ce")
        titlew.font = Font.boldSystemFont(12)
        w.addSpacer(6)
        const imgw = w.addImage(this.creatProgress(width, h, total, haveGone))
        imgw.imageSize = new Size(width, h)
        w.addSpacer(6)
    }

    creatProgress(width, h, total, havegone) {
        const context = new DrawContext()
        context.size = new Size(width, h)
        context.opaque = false
        context.respectScreenScale = true
        context.setFillColor(new Color("#48484b"))
        const path = new Path()
        path.addRoundedRect(new Rect(0, 0, width, h), 3, 2)
        context.addPath(path)
        context.fillPath()
        context.setFillColor(new Color("#ffd60a"))
        const path1 = new Path()
        path1.addRoundedRect(new Rect(0, 0, width * havegone / total, h), 3, 2)
        context.addPath(path1)
        context.fillPath()
        return context.getImage()
    }

    
    /**
     * 自定义注册点击事件，用 actionUrl 生成一个触发链接，点击后会执行下方对应的 action
     * @param {string} url 打开的链接
     */
    async actionOpenUrl(url) {
        Safari.openInApp(url, false)
    }

}
// @组件代码结束

const { Testing } = require("./「小件件」开发环境")
await Testing(Widget)