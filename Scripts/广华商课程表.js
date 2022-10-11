// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: magic;

if (typeof require === 'undefined') require = importModule
const { Base } = require("./「小件件」开发环境")


// @组件代码开始
class Widget extends Base {
  /**
   * 传递给组件的参数，可以是桌面 Parameter 数据，也可以是外部如 URLScheme 等传递的数据
   * @param {string} arg 自定义参数
   */
  constructor(arg) {
    super(arg);
    this.name = '广华商课程表';
    this.desc = '广州华商学院课程表信息';
    this.registerAction("登录广华商教务系统", this.actionLogin);
    this.cookie = this.getCookie();
  }

  
  getCookie(){
    if (Keychain.contains("gsonhub_cache_course_cookie")) { 
      let str = Keychain.get("gsonhub_cache_course_cookie");
      return str;
    }
    return 'JSESSIONID=F1AD6D4BDA6FA73FC0231F61A118DB7A; SERVERID=123';
  }
 

  async actionLogin() {

    //获取cookie
    let req = new Request("http://jwxt.gdhsc.edu.cn/jsxsd/xk/LoginToXk");
    req.method = "POST";
    await req.loadString();
    this.cookie = '';
    req.response.cookies.forEach(vo => {
      this.cookie += `${vo['name']}=${vo['value']}; `
    });
    console.log(this.cookie);

    req = new Request('http://jwxt.gdhsc.edu.cn/jsxsd/verifycode.servlet')
    req.headers = {
      'Cookie': this.cookie,
    }
    const img = await req.loadImage()

    QuickLook.present(img);
    let alert = new Alert();
    alert.title = '广华商教务系统';
    alert.message = '登录广州华商学院教务一体化系统'
    alert.addTextField('请输入账号', '421450251');
    alert.addSecureTextField('请输入密码');
    alert.addTextField('请输入验证码');
    alert.addAction('登录');
    alert.addCancelAction('取消');
    let res = await alert.presentAlert();//-1 取消 0确定
    const userAccount = alert.textFieldValue(0);
    const userPassword = alert.textFieldValue(1);
    const code = alert.textFieldValue(2);
    if (res === 0) {
      console.log('执行登录')
      await this.doLogin(userAccount, userPassword, code);
    }else{
      console.log('执行取消')
    }
  }


  encodeInp(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64
      } else if (isNaN(chr3)) {
        enc4 = 64
      }
      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
      chr1 = chr2 = chr3 = "";
      enc1 = enc2 = enc3 = enc4 = ""
    } while (i < input.length);
    return output
  }


  async doLogin(userAccount, userPassword, code) {
    const url = "http://jwxt.gdhsc.edu.cn/jsxsd/xk/LoginToXk";
    const login = new Request(url);
    login.method = "POST";
    login.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': this.cookie,
    }

    const encoded = encodeURIComponent(this.encodeInp(userAccount) + `%%%` + this.encodeInp(userPassword));
    login.body = `loginMethod=LoginToXk&userAccount=${userAccount}&userPassword=&RANDOMCODE=${code}&encoded=${encoded}`;
    let res = await login.loadString();

    let error = /"showMsg">	 (.*?)</.exec(res);
    if (error && error[1]) {
      this.notify("登录失败", "登录失败！"+error[1],'');
      console.log(error[1]);
    } else {
      console.log('登录成功！' + this.cookie);
      Keychain.set("gsonhub_cache_course_cookie",this.cookie);
      this.notify("登录成功", "登录凭证已保存！"+this.cookie,'');
    }
  }

  // this.notify("登录成功", "登录凭证已保存！可以关闭当前登录页面了！")

  /**
   * 渲染函数，函数名固定
   * 可以根据 this.widgetFamily 来判断小组件尺寸，以返回不同大小的内容
   */
  async render() {
    let data;
    try {
      data = await this.getInitData();
    } catch (error) {
      let w = new ListWidget();
      const tt = w.addText('登录已失效，请点我登录广华商教务系统');
      tt.textColor = new Color("#e00")
      tt.font = Font.boldSystemFont(12)
      console.log(error);
      return w;
    }

    switch (this.widgetFamily) {
      case 'large':
        return await this.renderLarge(data)
      case 'medium':
        return await this.renderMedium(data)
      default:
        return await this.renderSmall(data)
    }
  }

  async doHttpGet(url, cookies = null) {
    let cookie = cookies ? cookies : this.cookie;
    let req = new Request(url);
    req.method = "GET";
    req.headers = {
      Cookie: cookie
    }
    return await req.loadString();
  }


  /**
 * 示例:$.time('yyyy-MM-dd qq HH:mm:ss.S') $.time('yyyyMMddHHmmssS')
 * y:年 M:月 d:日 q:季 H:时 m:分 s:秒 S:毫秒 
 * 其中y可选0-4位占位符、S可选0-1位占位符，其余可选0-2位占位符
 * @param fmt 格式化参数
 * @param ts 根据指定时间戳返回格式化日期
 * @returns 
 */
  dateFormat(fmt, ts) {
    const date = ts ? new Date(ts) : new Date()
    let o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      'S': date.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (let k in o) {
      //@ts-ignore
      let item = o[k];
      if (new RegExp('(' + k + ')').test(fmt))
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? item : ('00' + item).substr(('' + item).length))
    }
    return fmt
  }

  async getInitData() {
    let res_arr = await this.getData();
    // console.log(res_arr);
    let week = this.getCurrentWeek(res_arr);
    this.week = week + 1; //
    let list = [];
    if (res_arr[week]) {
      list = list.concat(this.getDayData(res_arr[week]));
    }
    if (res_arr[week + 1]) {
      list = list.concat(this.getDayData(res_arr[week + 1]));
    }

    let date = new Date();
    let currenDate = this.dateFormat('yyyy/MM/dd', date);
    let nextDate = this.dateFormat('yyyy/MM/dd', new Date(date.setDate(date.getDate() + 1)));
    list = list.filter((vo) => { return (vo.date == currenDate || vo.date == nextDate) && vo.course; });

    return list;
  }

  getDayData(res) {
    const time_arr = [
      ['08:20', '09:55'], ['10:10', '11:45'], ['14:00', '15:35'], ['15:50', '17:25'], ['18:45', '21:20'], ['12:00', '13:50']
    ]
    let date_start = res.date, t = -1, res_list = [];
    const str = `${date_start}`;
    const t0 = new Date(str).getTime();
    for (let r = 0; r < res.data.length; r++) {
      let day = r % 7;
      if (day == 0) {
        t++;
      }

      // console.log(t0);
      let date0 = new Date(t0 + day * 24 * 60 * 60 * 1000);

      date0 = this.dateFormat('yyyy/MM/dd', date0);

      let json = {
        date: date0,
        week: res.week,
        time: time_arr[t],
        course: res.data[r]
      };
      res_list.push(json);
      res_list = res_list.sort((a, b) => {
        const da = `${a.date} ${a.time[0]}`;
        const db = `${b.date} ${b.time[0]}`;
        // console.log(da+'=='+db);
        return new Date(da).getTime() - new Date(db).getTime()
      });
    }
    return res_list;
  }

  getCurrentWeek(res_arr) {
    let list = [];
    for (let i = 0; i < res_arr.length; i++) {
      const res = res_arr[i];
      const ttt = new Date().getTime();
      const limit = new Date(`${res['date']} 00:00:00`).getTime();
      if (ttt > limit && ttt < (limit + 7 * 24 * 60 * 60 * 1000 - 1)) {
        return i;
      }
    }
    throw new Error('未获取到本周课程数据');
  }

  async fetchWeekCourseByDate(body, date) {
    let [, sjmsValue] = /class="layui-this" data-value="([0-9a-zA-Z]+)"/.exec(body);
    let [, xnxqid] = /xnxqid="\+"([0-9-]+)"\)/.exec(body)
    let url = `http://jwxt.gdhsc.edu.cn/jsxsd/framework/mainV_index_loadkb.htmlx?rq=${date}&sjmsValue=${sjmsValue}&xnxqid=${xnxqid}`;
    body = await this.doHttpGet(url);
    const preg = /<p>(.*?)<\/p><p>(.*?)<\/p><span class=[^>]+>(.*?)<\/span><\/span><div class=[^>]+><p>(.*?)<\/p><div class=[^>]+><span>(.*?)<\/span><span>(.*?)<\/span><\/div><div><span><img src=[^>]+>(.*)?<\/span><span><img src=[^>]+>(.*)?<\/span>/;
    let arr = body.match(/<td align="left">(\r\n.*\r\n.*\r\n.*\r\n.*)<\/td>/g);
    let res = arr.map(str => { return preg.test(str) ? preg.exec(str).slice(1) : false; });
    return res;
  }

  async getData() {
    if (Keychain.contains("gsonhub_cache_course")) {
      let str = Keychain.get("gsonhub_cache_course");
      try {
        //return JSON.parse(str);
      } catch (error) {

      }
    }

    let body = await this.doHttpGet("http://jwxt.gdhsc.edu.cn/jsxsd/framework/xsMainV_new.htmlx?t1=1");

    let date_arr = body.match(/<option value="([0-9-_]+)"[^>]*>(.*?)<\/option>/g);
    date_arr = date_arr.map(str => { const temp = /<option value="([0-9-_]+)"[^>]*>(.*?)<\/option>/.exec(str); return temp[1] });

    let res_arr = [];
    let len = date_arr.length;

    //todo

    
    for (let w = 6; w < 9; w++) {
      let date = date_arr[w];
      const data = await this.fetchWeekCourseByDate(body, date);
      let json = {
        date: date.replace(/\-/g, '\/'),
        data: data,
        week: w + 1,
      };
      res_arr.push(json);
    }
    if (res_arr.length > 0) Keychain.set("gsonhub_cache_course", JSON.stringify(res_arr));
    return res_arr;

  }


  rowText(w, opt) {
    const stack = w.addStack();
    if (opt.icon) {
      const icon = SFSymbol.named(opt.icon);
      icon.applyHeavyWeight();
      const img = stack.addImage(icon.image);
      img.tintColor = new Color(opt.color, 1);
      img.imageSize = new Size(opt.size + 1, opt.size + 1);
    }

    let title = stack.addText(opt.text);
    title.textColor = new Color(opt.color)
    title.font = opt.bold ? Font.boldSystemFont(opt.size) : Font.systemFont(opt.size)
  }

  async renderForHeader(w, isDate = true) {
    const stack = w.addStack();
    const img = await this.getImageByUrl("http://jwxt.gdhsc.edu.cn/jsxsd/assets/images/logo.png");
    const img_logo = stack.addImage(img);
    img_logo.imageSize = new Size(242 * 0.38, 72 * 0.38);

    stack.addSpacer(5);

    if (!isDate) return;

    let month = new Date().getMonth() + 1;
    const icon = SFSymbol.named(`${month}.square`);
    icon.applyHeavyWeight();
    const image = stack.addImage(icon.image);
    image.tintColor = new Color('#fff', 1);
    image.imageSize = new Size(24, 24);

    let day = new Date().getDate();
    const icon2 = SFSymbol.named(`${day}.square`);
    icon2.applyHeavyWeight();
    const image2 = stack.addImage(icon2.image);
    image2.tintColor = new Color('#fff', 1);
    image2.imageSize = new Size(24, 24);
    //1
  }

  /**
   * 渲染小尺寸组件
   */
  async renderSmall(list) {
    // console.log(list);
    let w = new ListWidget();
    const bg = new LinearGradient();
    bg.locations = [0, 1];
    bg.colors = [
      new Color('#a30000', 0.06),
      new Color('#a30000', 0.5)
    ];
    w.backgroundGradient = bg;
    await this.renderForHeader(w);
    if (list.length > 0) {

      for (let i = 0; i < list.length; i++) {
        if (new Date().getTime() < new Date(`${list[i]['date']} ${list[i]['time'][1]}`).getTime()) {
          list = list.slice(i, i + 3);
          break;
        }
      }

      const today = this.dateFormat('yyyy/MM/dd');
      for (let i = 0; i < list.length; i++) {
        let obj = list[i];
        let course = obj['course'];
        let ccc = course[5];
        let txt = obj['date'] == today ? '今天' : '明天';
        this.rowText(w, { icon: 'timer', color: '#a30', size: 11, text: `${txt}${obj['time'][0]}, ${ccc}` });
        this.rowText(w, { icon: 'location', color: '#a30', size: 12, text: course[6] });
        this.rowText(w, { icon: 'book', bold: true, color: '#a30', size: 12, text: course[3] });
        w.addSpacer(4)
      }
    } else {
      w.addSpacer(10)
      this.rowText(w, { icon: 'face.smiling', bold: true, color: '#FFF', size: 14, text: '这两天没有课要上' });
    }

    return w
  }


  /**
   * 渲染中尺寸组件
   */
  async renderMedium(list) {
    let w = new ListWidget();
    const bg = new LinearGradient();
    bg.locations = [0, 1];
    bg.colors = [
      new Color('#a30000', 0.06),
      new Color('#a30000', 0.5)
    ];

    w.backgroundGradient = bg;

    let bodyStack = w.addStack();
    const column0 = bodyStack.addStack();
    column0.cornerRadius = 0;
    column0.layoutVertically();

    await this.renderForHeader(column0, 0);

    const today = this.dateFormat('yyyy/MM/dd');

    if (list.length > 0) {
      let row0 = list.slice(0, 3);
      for (let i = 0; i < row0.length; i++) {
        let obj = row0[i];
        let course = obj['course'];
        let ccc = course[5];
        let txt = obj['date'] == today ? '今天' : '明天';
        this.rowText(column0, { icon: 'timer', color: '#a30', size: 11, text: `${txt}${obj['time'][0]} ${ccc}` });
        this.rowText(column0, { icon: 'location', color: '#a30', size: 12, text: course[6] });
        this.rowText(column0, { icon: 'book', bold: true, color: '#a30', size: 12, text: course[3] });
        column0.addSpacer(4)
      }
    } else {
      column0.addSpacer(10)
      this.rowText(column0, { icon: 'face.smiling', bold: true, color: '#FFF', size: 14, text: '这两天没有课要上' });
    }

    bodyStack.addSpacer(20);
    const column1 = bodyStack.addStack();
    column1.cornerRadius = 0;
    column1.layoutVertically();
    column1.addSpacer(10)

    if (list.length > 0) {
      let row1 = list.slice(3, 6);
      for (let i = 0; i < row1.length; i++) {
        let obj = row1[i];
        let course = obj['course'];
        let ccc = course[5];
        let txt = obj['date'] == today ? '今天' : '明天';
        this.rowText(column1, { icon: 'timer', color: '#a30', size: 11, text: `${txt}${obj['time'][0]} ${ccc}` });
        this.rowText(column1, { icon: 'location', color: '#a30', size: 12, text: course[6] });
        this.rowText(column1, { icon: 'book', bold: true, color: '#a30', size: 12, text: course[3] });
        column1.addSpacer(4)
      }
    }
    return w
  }



  /**
   * 渲染大尺寸组件
   */
  async renderLarge(list) {
    return await this.renderMedium(list)
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