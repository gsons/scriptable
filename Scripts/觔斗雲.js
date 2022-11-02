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
    constructor(arg) {
        super(arg);
        this.name = '筋斗云';
        this.desc = '筋斗云数据面板'
        this.en = 'jindouyun';
        this.logo = 'https://pic.imgdb.cn/item/630ec91116f2c2beb17590da.png';
        this.verticalLogo = 'https://pic.imgdb.cn/item/630ecac516f2c2beb1766cd4.png';
        this.cookie = this.getCache('cookie');
    }

    widgetParam = args.widgetParameter;
    cookie = ''; // 

    gradient = false;

    flowColorHex = '12A6E4';
    voiceColorHex = 'F86527';

    ringStackSize = 61;
    ringTextSize = 14;
    feeTextSize = 21;
    textSize = 13;
    smallPadding = 16;
    padding = 10;
    logoScale = 0.24;

    canvSize = 178;
    canvWidth = 18;
    canvRadius = 80;

    format = (str) => {
        return parseInt(str) >= 10 ? str : `0${str}`;
    };

    date = new Date();
    arrUpdateTime = [
        this.format(this.date.getMonth() + 1),
        this.format(this.date.getDate()),
        this.format(this.date.getHours()),
        this.format(this.date.getMinutes()),
    ];

    fee = {
        title: '话费剩余',
        number: 0,
        unit: '元',
        en: '¥',
    };

    flow = {
        percent: 0,
        title: '已用流量',
        number: 0,
        unit: 'MB',
        en: 'MB',
        icon: 'antenna.radiowaves.left.and.right',
        iconColor: new Color('1ab6f8'),
        FGColor: new Color(this.flowColorHex),
        BGColor: new Color(this.flowColorHex, 0.2),
        colors: [],
    };

    voice = {
        percent: 0,
        title: '语音剩余',
        number: 0,
        unit: '分钟',
        en: 'MIN',
        icon: 'phone.fill',
        iconColor: new Color('30d15b'),
        FGColor: new Color(this.voiceColorHex),
        BGColor: new Color(this.voiceColorHex, 0.2),
        colors: [],
    };

    point = {
        title: '剩余积分',
        number: 0,
        unit: '',
        icon: 'tag.fill',
        iconColor: new Color('fc6d6d'),
    }



    async smallHeader(stack) {
        const headerStack = stack.addStack();
        headerStack.addSpacer();
        const logo = headerStack.addImage(await this.getImageByUrl(this.logo));
        logo.imageSize = new Size(415 * this.logoScale, 125 * this.logoScale);
        headerStack.addSpacer();
        stack.addSpacer();

        const feeStack = stack.addStack();
        feeStack.centerAlignContent();
        feeStack.addSpacer();
        const feeValue = feeStack.addText(`${this.fee.number}`);
        feeValue.font = Font.mediumRoundedSystemFont(this.feeTextSize);
        feeValue.textColor = this.widgetColor;
        feeStack.addSpacer();
        stack.addSpacer();
    }

    textLayout(stack, data) {
        const rowStack = stack.addStack();
        rowStack.centerAlignContent();
        const icon = SFSymbol.named(data.icon);
        icon.applyHeavyWeight();
        let iconElement = rowStack.addImage(icon.image);
        iconElement.imageSize = new Size(this.textSize, this.textSize);
        iconElement.tintColor = data.iconColor;
        rowStack.addSpacer(4);
        let title = rowStack.addText(data.title);
        rowStack.addSpacer();
        let number = rowStack.addText(data.number + data.unit);
        ;[title, number].map(t => t.textColor = this.widgetColor);
        ;[title, number].map(t => t.font = Font.systemFont(this.textSize));
    }

    async mediumCell(canvas, stack, data, color, fee = false, percent) {
        const bg = new LinearGradient();
        bg.locations = [0, 1];
        bg.colors = [
            new Color(color, 0.03),
            new Color(color, 0.1)
        ];
        const dataStack = stack.addStack();
        dataStack.backgroundGradient = bg;
        dataStack.cornerRadius = 20;
        dataStack.layoutVertically();
        dataStack.addSpacer();

        const topStack = dataStack.addStack();
        topStack.addSpacer();
        await this.imageCell(canvas, topStack, data, fee, percent);
        topStack.addSpacer();

        if (fee) {
            dataStack.addSpacer(5);
            const updateStack = dataStack.addStack();
            updateStack.addSpacer();
            updateStack.centerAlignContent();
            const updataIcon = SFSymbol.named('arrow.2.circlepath');
            updataIcon.applyHeavyWeight();
            const updateImg = updateStack.addImage(updataIcon.image);
            updateImg.tintColor = new Color(color, 0.6);
            updateImg.imageSize = new Size(10, 10);
            updateStack.addSpacer(3);
            const updateText = updateStack.addText(`${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`)
            updateText.font = Font.mediumSystemFont(10);
            updateText.textColor = new Color(color, 0.6);
            updateStack.addSpacer();
        }

        dataStack.addSpacer();

        const numberStack = dataStack.addStack();
        numberStack.addSpacer();
        const number = numberStack.addText(`${data.number} ${data.en}`);
        number.font = Font.semiboldSystemFont(12);
        numberStack.addSpacer();

        dataStack.addSpacer(3);

        const titleStack = dataStack.addStack();
        titleStack.addSpacer();
        const title = titleStack.addText(data.title);
        title.font = Font.mediumSystemFont(11);
        title.textOpacity = 0.7;
        titleStack.addSpacer();

        dataStack.addSpacer(15);
        ;[title, number].map(t => t.textColor = new Color(color));
    }

    async imageCell(canvas, stack, data, fee, percent) {
        const canvaStack = stack.addStack();
        canvaStack.layoutVertically();
        if (!fee) {
            this.drawArc(canvas, data.percent * 3.6, data.FGColor, data.BGColor);
            canvaStack.size = new Size(this.ringStackSize, this.ringStackSize);
            canvaStack.backgroundImage = canvas.getImage();
            this.ringContent(canvaStack, data, percent);
        } else {
            canvaStack.addSpacer(10);
            const smallLogo = await this.getImageByUrl(this.verticalLogo);
            const logoStack = canvaStack.addStack();
            logoStack.size = new Size(40, 40);
            logoStack.backgroundImage = smallLogo;
        }
    }

    ringContent(stack, data, percent = false) {
        const rowIcon = stack.addStack();
        rowIcon.addSpacer();
        const icon = SFSymbol.named(data.icon);
        icon.applyHeavyWeight();
        const iconElement = rowIcon.addImage(icon.image);
        iconElement.tintColor = this.gradient ? new Color(data.colors[1]) : data.FGColor;
        iconElement.imageSize = new Size(12, 12);
        iconElement.imageOpacity = 0.7;
        rowIcon.addSpacer();

        stack.addSpacer(1);

        const rowNumber = stack.addStack();
        rowNumber.addSpacer();
        const number = rowNumber.addText(percent ? `${data.percent}` : `${data.number}`);
        number.font = percent ? Font.systemFont(this.ringTextSize - 2) : Font.mediumSystemFont(this.ringTextSize);
        rowNumber.addSpacer();

        const rowUnit = stack.addStack();
        rowUnit.addSpacer();
        const unit = rowUnit.addText(percent ? '%' : data.unit);
        unit.font = Font.boldSystemFont(8);
        unit.textOpacity = 0.5;
        rowUnit.addSpacer();

        if (percent) {
            if (this.gradient) {
                ;[unit, number].map(t => t.textColor = new Color(data.colors[1]));
            } else {
                ;[unit, number].map(t => t.textColor = data.FGColor);
            }
        } else {
            ;[unit, number].map(t => t.textColor = this.widgetColor);
        }
    }

    makeCanvas() {
        const canvas = new DrawContext();
        canvas.opaque = false;
        canvas.respectScreenScale = true;
        canvas.size = new Size(this.canvSize, this.canvSize);
        return canvas;
    }

    sinDeg(deg) {
        return Math.sin((deg * Math.PI) / 180);
    }

    cosDeg(deg) {
        return Math.cos((deg * Math.PI) / 180);
    }

    drawArc(canvas, deg, fillColor, strokeColor) {
        let ctr = new Point(this.canvSize / 2, this.canvSize / 2);
        let bgx = ctr.x - this.canvRadius;
        let bgy = ctr.y - this.canvRadius;
        let bgd = 2 * this.canvRadius;
        let bgr = new Rect(bgx, bgy, bgd, bgd)

        canvas.setStrokeColor(strokeColor);
        canvas.setLineWidth(this.canvWidth);
        canvas.strokeEllipse(bgr);

        for (let t = 0; t < deg; t++) {
            let rect_x = ctr.x + this.canvRadius * this.sinDeg(t) - this.canvWidth / 2;
            let rect_y = ctr.y - this.canvRadius * this.cosDeg(t) - this.canvWidth / 2;
            let rect_r = new Rect(rect_x, rect_y, this.canvWidth, this.canvWidth);
            canvas.setFillColor(this.gradient ? new Color(fillColor[t]) : fillColor);
            canvas.setStrokeColor(strokeColor)
            canvas.fillEllipse(rect_r);
        }
    }

    arrColor() {
        let colorArr = [['#FFF000', '#E62490'], ['#ABDCFF', '#0396FF'], ['#FEB692', '#EA5455'], ['#FEB692', '#EA5455'], ['#CE9FFC', '#7367F0'], ['#90F7EC', '#32CCBC'], ['#FFF6B7', '#F6416C'], ['#E2B0FF', '#9F44D3'], ['#F97794', '#F072B6'], ['#FCCF31', '#F55555'], ['#5EFCE8', '#736EFE'], ['#FAD7A1', '#E96D71'], ['#FFFF1C', '#00C3FF'], ['#FEC163', '#DE4313'], ['#F6CEEC', '#D939CD'], ['#FDD819', '#E80505'], ['#FFF3B0', '#CA26FF'], ['#EECDA3', '#EF629F'], ['#C2E59C', '#64B3F4'], ['#FFF886', '#F072B6'], ['#F5CBFF', '#C346C2'], ['#FFF720', '#3CD500'], ['#FFC371', '#FF5F6D'], ['#FFD3A5', '#FD6585'], ['#C2FFD8', '#465EFB'], ['#FFC600', '#FD6E6A'], ['#FFC600', '#FD6E6A'], ['#92FE9D', '#00C9FF'], ['#FFDDE1', '#EE9CA7'], ['#F0FF00', '#58CFFB'], ['#FFE985', '#FA742B'], ['#72EDF2', '#5151E5'], ['#F6D242', '#FF52E5'], ['#F9D423', '#FF4E50'], ['#00EAFF', '#3C8CE7'], ['#FCFF00', '#FFA8A8'], ['#FF96F9', '#C32BAC'], ['#FFDD94', '#FA897B'], ['#FFCC4B', '#FF7D58'], ['#D0E6A5', '#86E3CE'], ['#F0D5B6', '#F16238'], ['#C4E86B', '#00BCB4'], ['#FFC446', '#FA0874'], ['#E1EE32', '#FFB547'], ['#FFD804', '#2ACCC8'], ['#E9A6D2', '#E9037B'], ['#F8EC70', '#49E2F6'], ['#A2F8CD', '#A2F852'], ['#A2F8CD', '#00C3FF'], ['#FDEFE2', '#FE214F'], ['#F8EC70', '#A2F8CD'], ['#F8EC70', '#49E2F6'], ['#FFB7D1', '#E4B7FF'], ['#D0E6A5', '#86E3CE'], ['#E8E965', '#64C5C7']];
        let colors = colorArr[Math.floor(Math.random() * colorArr.length)];
        return colors;
    }

    gradientColor(colors, step) {
        var startRGB = this.colorToRgb(colors[0]),
            startR = startRGB[0],
            startG = startRGB[1],
            startB = startRGB[2];

        var endRGB = this.colorToRgb(colors[1]),
            endR = endRGB[0],
            endG = endRGB[1],
            endB = endRGB[2];

        var sR = (endR - startR) / step,
            sG = (endG - startG) / step,
            sB = (endB - startB) / step;

        var colorArr = [];
        for (var i = 0; i < step; i++) {
            var hex = this.colorToHex('rgb(' + parseInt((sR * i + startR)) + ',' + parseInt((sG * i + startG)) + ',' + parseInt((sB * i + startB)) + ')');
            colorArr.push(hex);
        }
        return colorArr;
    }

    colorToRgb(sColor) {
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var sColor = sColor.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return sColorChange;
        } else {
            return sColor;
        }
    };

    colorToHex(rgb) {
        var _this = rgb;
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        if (/^(rgb|RGB)/.test(_this)) {
            var aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
            var strHex = "#";
            for (var i = 0; i < aColor.length; i++) {
                var hex = Number(aColor[i]).toString(16);
                hex = hex.length < 2 ? 0 + '' + hex : hex;
                if (hex === "0") {
                    hex += hex;
                }
                strHex += hex;
            }
            if (strHex.length !== 7) {
                strHex = _this;
            }

            return strHex;
        } else if (reg.test(_this)) {
            var aNum = _this.replace(/#/, "").split("");
            if (aNum.length === 6) {
                return _this;
            } else if (aNum.length === 3) {
                var numHex = "#";
                for (var i = 0; i < aNum.length; i += 1) {
                    numHex += (aNum[i] + aNum[i]);
                }
                return numHex;
            }
        } else {
            return _this;
        }
    }

    /**
     * 
     * @param {ListWidget} w 
     * @returns 
     */
    renderSmall = async (w) => {
        if (this.widgetParam == "123456") {
            w.setPadding(this.smallPadding, this.smallPadding, this.smallPadding, this.smallPadding);
            await this.smallHeader(w);
            const bodyStack = w.addStack();
            bodyStack.layoutVertically();
            this.textLayout(bodyStack, this.flow);
            bodyStack.addSpacer(7);
            this.textLayout(bodyStack, this.voice);
            bodyStack.addSpacer(7);
            this.textLayout(bodyStack, this.point);
        } else {
            this.smallPadding = 14;
            w.setPadding(this.smallPadding, this.smallPadding, this.smallPadding, this.smallPadding);

            const headerStack = w.addStack();
            headerStack.addSpacer();
            const title = headerStack.addText("筋斗云");
            title.font = Font.mediumSystemFont(14);
            //const logo = headerStack.addImage(await this.getImageByUrl(this.logo));
            //logo.imageSize = new Size(415 * this.logoScale * 0.7, 125 * this.logoScale * 0.7);
            headerStack.addSpacer(2);

            const signStack = headerStack.addStack();
            const signIcon = SFSymbol.named('checkmark.icloud');
            signIcon.applyHeavyWeight();
            const signImg = signStack.addImage(signIcon.image);
            signImg.tintColor = this.is_check_in ? new Color('#007b36', 1) : new Color('#999', 0.6);
            signImg.imageSize = new Size(19, 19);
            signStack.addSpacer(1);
            const updateText = signStack.addText(`${this.arrUpdateTime[2]}:${this.arrUpdateTime[3]}`)
            updateText.font = Font.mediumSystemFont(10);
            updateText.textColor = new Color('#d7000f', 0.6);
            headerStack.addSpacer();

            w.addSpacer(3);

            const usStack = w.addStack();
            this.smallTextLayout(usStack, this.online_user);
            w.addSpacer(3);

            // const expirStack = w.addStack();
            // this.smallTextLayout(expirStack, this.expire_data);
            // w.addSpacer(3);

            const flow1Stack = w.addStack();
            this.smallTextLayout(flow1Stack, this.flow_day);
            w.addSpacer(3);
            const flow2Stack = w.addStack();
            this.smallTextLayout(flow2Stack, this.flow_month);
            w.addSpacer(3);

            const flow3Stack = w.addStack();
            this.smallTextLayout(flow3Stack, this.flow_all);
            w.addSpacer();

            const bodyStack = w.addStack();
            bodyStack.layoutVertically();
            const canvas = this.makeCanvas();
            const ringStack = bodyStack.addStack();
            this.imageCell(canvas, ringStack, this.flow_day);
            ringStack.addSpacer();
            this.imageCell(canvas, ringStack, this.flow_month);
        }
        return w;
    };


    smallTextLayout(stack, data) {
        this.textSize = 12;
        const rowStack = stack.addStack();
        rowStack.centerAlignContent();
        const icon = SFSymbol.named(data.icon);
        icon.applyHeavyWeight();
        let iconElement = rowStack.addImage(icon.image);
        iconElement.imageSize = new Size(this.textSize, this.textSize);
        iconElement.tintColor = data.iconColor;
        rowStack.addSpacer(4);
        let title = rowStack.addText(data.title_free);
        rowStack.addSpacer();
        let number = rowStack.addText(data.number_free + data.unit);
        ;[title, number].map(t => t.textColor = this.widgetColor);
        ;[title, number].map(t => t.font = Font.systemFont(this.textSize));
    }

    account = {
        title: '筋斗云',
        url: 'https://www.somersaultcloud.xyz/auth/login',
        email: 'q6955017@gmail.com',
        password: '',
    };


    async doLogin() {
        const table = {
            url: this.account.url,
            body: `email=${encodeURIComponent(this.account.email)}&passwd=${encodeURIComponent(this.account.password)}&code=&remember_me=on`,
        };
        const req = new Request(table.url);
        req.headers = {
            'cookie': '',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'referer': this.account.url,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.42'
        }
        req.body = table.body;
        req.method = 'POST';

        const str = await req.loadString();
        let data;
        try {
            data = JSON.parse(str);
            console.log(str);
        } catch (error) {
            console.log('系统错误：' + error)
            return;
        }
        if (data.ret) {
            console.log('登陆成功');
            this.cookie = req.response.cookies.map(item => `${item.name}=${item.value}`).join('; ');
            this.setCache('cookie', this.cookie);
        } else {
            console.log('登陆失败，' + data.msg);
        }
    }

    async doCheckin() {
        const url = this.account.url;
        let checkinPath =
            url.indexOf('auth/login') !== -1 ? 'user/checkin' : 'user/_checkin.php';
        const checkinreqest = {
            url: url.replace(/(auth|user)\/login(.php)*/g, '') + checkinPath,
            headers: {
                'cookie': this.cookie,
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.42'
            }
        };
        const req = new Request(checkinreqest.url);
        req.headers = checkinreqest.headers;
        req.method = 'POST';
        const str = await req.loadString();
        let data;
        try {
            data = JSON.parse(str);
            console.log(str);
        } catch (error) {
            console.log('系统错误：' + error)
        }
        if (data.ret) {
            this.notify('签到成功', data.msg, '');
            console.log('签到成功');
        } else {
            console.log('签到失败，' + data.msg);
        }
        return data;
    }

    async fetchHomeHtml() {
        const url = "https://www.somersaultcloud.xyz/user";
        const req = new Request(url);
        req.headers = {
            'cookie': this.cookie,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.42'
        }
        const html = await req.loadString();
        return html;
    }


    async fetchJindouyun(html) {
        let [, expire_day] = /<span class="counter">(\d+)<\/span> 天/.exec(html);
        let [, used_flow_month, used_flow_month_unit] = /trafficDountChat\(\n\s+'(\d+\.*\d+)(GB|MB|KB)/.exec(html);
        let [, expire_date] = /(\d{4}-\d{2}-\d{2}) 过期/.exec(html);
        let isCheck = /"far fa-calendar-check"><\/i> 明日再来<\/a>/.test(html)
        let [, remain_flow, remain_flow_unit] = /<h4>剩余流量<\/h4>\n\s+<\/div>\n\s+<div class="card-body">\n\s+<span class="counter">(.*)?<\/span> (MB|GB|KB)/.exec(html);
        let [, online, sum] = /<h4>同时在线设备数<\/h4>\n\s+<\/div>\n\s+<div class="card-body">\n\s+<span class="counter">(\d+)<\/span> \/ <span class="counterup">(\d+)<\/span>/.exec(html);
        let [, used_flow_day, used_flow_day_unit] = /今日已用: (\d+\.*\d+)(MB|GB|KB)<\/li>/.exec(html);
        let [, last_used_date] = /上次使用时间: (.*?)<\/li>/.exec(html);
        let [, momey] = /<h4>钱包余额<\/h4>\n\s+<\/div>\n\s+<div class="card-body">\n\s+¥\s+<span class="counter">(.*)?<\/span>/.exec(html);
        let [, commission] = /累计获得返利金额: ¥(.*?)<\/li>/.exec(html);

        if (!isCheck) {
            let res = await this.doCheckin();
            if (res.ret) {
                isCheck = true;
            }
        }
        let res = {
            is_check_in: isCheck,
            expire_date: expire_date,
            expire_day: expire_day,
            remain_flow: remain_flow,
            remain_flow_unit: remain_flow_unit,
            used_flow_month: used_flow_month,
            used_flow_month_unit: used_flow_month_unit,
            online: online,
            sum: sum,
            used_flow_day: used_flow_day,
            used_flow_day_unit: used_flow_day_unit,
            last_used_date: last_used_date,
            momey: momey,
            commission: commission
        };
        return res;
    }

    async initJdy(isTry = true) {
        try {
            const html = await this.fetchHomeHtml();
            let obj = await this.fetchJindouyun(html);
            return obj;
        } catch (error) {
            console.log('抓取失败，' + error);
        }
        if (isTry) {
            console.log('尝试重新登陆');
            try {
                await this.doLogin();
            } catch (error) {
                console.error('登陆异常：' + error);
            }
            return await this.initJdy(false);
        } else {
            return false;
        }
    }

    convertMb(num, unit) {
        if (unit === 'GB') {
            return Math.ceil(num * 1024);
        }
        else if (unit === 'KB') {
            return Math.ceil(num / 1024);
        }
        return Math.ceil(num);
    }

    async initData() {
        const obj = await this.initJdy();
        if (!obj) return false;
        console.log(obj);

        this.is_check_in = obj.is_check_in;
        this.online_user = { 
            icon: 'person.2.wave.2', 
            iconColor: new Color('#007b36'), 
            number_free: obj.online, 
            unit: `人•${obj.expire_day%30+1}d`, 
            title_free: '在线用户' 
        };

        let remain_flow = this.convertMb(obj.remain_flow % 100, obj.remain_flow_unit);
        let used_flow_month = this.convertMb(obj.used_flow_month, obj.used_flow_month_unit);
        let used_flow_day = this.convertMb(obj.used_flow_day, obj.used_flow_day_unit);
        console.log([remain_flow, used_flow_month, used_flow_day])
        let percent = used_flow_day / (1024 / 30);
        this.flow_day = {
            percent: percent.toFixed(0),
            title: '本日F流量',
            title_free: '本日已用',
            number: used_flow_day.toFixed(0),
            number_free:used_flow_day.toFixed(0),
            unit: 'MB',
            en: 'MB',
            icon: 'antenna.radiowaves.left.and.right',
            iconColor: new Color('12A6E4'),
            FGColor: new Color('12A6E4'),
            BGColor: new Color('12A6E4', 0.2),
            colors: [],
        };

        percent = used_flow_month / 1024;
        this.flow_month = {
            percent: percent.toFixed(0),
            title: '本月F流量',
            title_free: '本月已用',
            number: (used_flow_month / 1024).toFixed(1),
            number_free: (used_flow_month / 1024).toFixed(1),
            unit: 'GB',
            en: 'GB',
            icon: 'antenna.radiowaves.left.and.right',
            iconColor: new Color('F86527'),
            FGColor: new Color('F86527'),
            BGColor: new Color('F86527', 0.2),
            colors: [],
        };
        
        this.expire_data = { 
            icon: 'timer', 
            iconColor: new Color('#F86527'), 
            number_free: obj.expire_day%30+1, 
            unit: '天', 
            title_free: '有效期剩' 
        };


        const remain_flow_month = Math.abs(obj.remain_flow - (Math.floor(obj.expire_day / 30)* 100)).toFixed(0);
        this.flow_all = {
            percent: 0,
            title: '本月总流量',
            title_free: '本月流量剩',
            number: remain_flow_month,
            number_free: remain_flow_month,
            unit: `GB`,
            en: 'GB',
            icon: 'antenna.radiowaves.left.and.right',
            iconColor: new Color('d7000f'),
            FGColor: new Color('d7000f'),
            BGColor: new Color('d7000f', 0.2),
            colors: [],
        };
        return true;
    }

    renderMedium = async (w) => {
        w.setPadding(this.padding, this.padding, this.padding, this.padding);
        const canvas = this.makeCanvas();
        const bodyStack = w.addStack();
        await this.mediumCell(canvas, bodyStack, this.fee, 'd7000f', true);
        bodyStack.addSpacer(this.padding);
        await this.mediumCell(canvas, bodyStack, this.flow_day, '12A6E4', false, true);
        bodyStack.addSpacer(this.padding);
        await this.mediumCell(canvas, bodyStack, this.flow_month, 'F86527', false, true);
        bodyStack.addSpacer(this.padding);
        await this.mediumCell(canvas, bodyStack, this.flow_all, 'd7000f', false, true);
        return w;
    };


    renderLarge = async (w) => {
        w.addText('暂不支持')
        return w;
    };


    /**
  * 
  * @param  _key 
  * @param  val 
  * @param  expire //单位秒
  */
    setCache(_key, val, expire = 0) {
        let key = `gsonhub_jindouyun_cache_${_key}`;
        let obj = {
            data: val,
            expire: expire === 0 ? expire : (new Date().getTime() + expire * 1000)
        }
        Keychain.set(key, JSON.stringify(obj));
    }

    clearCache(_key) {
        let key = `gsonhub_jindouyun_cache_${_key}`;
        Keychain.remove(key);
    }

    getCache(_key) {
        let key = `gsonhub_jindouyun_cache_${_key}`;
        if (Keychain.contains(key)) {
            let str = Keychain.get(key);
            // console.log(str);
            try {
                let obj = JSON.parse(str);
                if ((obj.expire && obj.expire > new Date().getTime()) || obj.expire === 0) {
                    return obj.data;
                } else {
                    Keychain.remove(key);
                }
            } catch (error) {

            }
        }
        return null;
    }


    
    /**
     * 自定义注册点击事件，用 actionUrl 生成一个触发链接，点击后会执行下方对应的 action
     * @param {string} url 打开的链接
     */
     async actionOpenUrl(url) {
        Safari.openInApp(url, false)
    }

    async render() {
        const widget = new ListWidget();
        let res = await this.initData();
        if (!res) return widget;
        if (this.widgetFamily === 'medium') {
            return await this.renderMedium(widget);
        } else if (this.widgetFamily === 'large') {
            return await this.renderLarge(widget);
        } else {
            return await this.renderSmall(widget);
        }
    }
}
// @组件代码结束

const { Testing } = require("./「小件件」开发环境")
await Testing(Widget)