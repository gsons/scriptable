/**
 * 自动登录签到领取VPN流量,请在 [PFVPN官网注册账号](https://purefast.net/),并把账号信息写在pfvpn.js文件，把修改后的代码复制到clash的Mixin的JavaScript执行。
 */

module.exports.parse = async ({ content, name, url }, { yaml, axios, notify }) => {

    const $fs = require('fs');
    const $path = require('path');


    class PFVPN {

        cookie = '';

        opt = {
            url: 'https://purefast.net/',
            email: 'qq17318145454@gmail.com',
            password: 'helloqq17318145454',
        };

        log(msg) {
            let str = new Date().toISOString() + '   ' + msg;
            if ($fs.existsSync(this.log_file)) {
                str = $fs.readFileSync(this.log_file).toString() + '\n' + str;
            }
            $fs.writeFileSync(this.log_file, str);
        }


        getformData(params) {
            return Object.keys(params).map(v => `${v}=${encodeURI(params[v])}`).join('&')
        }

        constructor() {
            this.log_file = $path.join(process.cwd(), "resources/", "pfvpn.log.txt");
            this.proxy_file = $path.join(process.cwd(), "resources/", "pfvpn.proxy.txt");
            this.cookie_file = $path.join(process.cwd(), "resources/", "pfvpn.cookie.txt");
            if ($fs.existsSync(this.cookie_file)) {
                this.cookie = $fs.readFileSync(this.cookie_file).toString();
            } else {
                $fs.writeFileSync(this.cookie_file, this.cookie);
            }
        }

        doRequest(opt) {
            return new Promise((resolve, reject) => {
                let data = opt.data ? opt.data : '';
                let options = {
                    protocol: 'https:',
                    hostname: 'purefast.net',
                    port: 443,
                    path: '',
                    method: 'GET',
                    headers: {
                        'cookie': this.cookie,
                        'Content-Length': data.length,
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.26',
                    }
                };
                if (opt.headers) options.headers = { ...options.headers, ...opt.headers };

                options = { ...options, ...opt };

                // console.log(options);
                const req = require('https').request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve({ headers: res.headers, data: data.toString() });
                    });
                }).on("error", (err) => {
                    reject(err);
                });
                req.write(data);
                req.end();
            });
        }

        async doLogin() {
            let params = {
                code: '',
                remember_me: 'on',
                email: this.opt.email,
                passwd: this.opt.password
            };
            let data = this.getformData(params);
            let method = 'POST', path = '/auth/login';
            this.cookie = '';
            let res = await this.doRequest({ method, data, path });

            this.cookie = res['headers']['set-cookie'];
            if (!this.cookie) { this.log('登录失败！'); throw new Error('登录失败'); }
            else {
                this.cookie = this.cookie.join('; ');
                this.log('登录成功,写入COOKIE ' + this.cookie);
                $fs.writeFileSync(this.cookie_file, this.cookie);
            }
        }

        async fetchProxy(canLogin = true) {
            let path = '/user';
            let res = await this.doRequest({ path });
            let exe_url = /oneclickImport\('clash','([^']+)'\)/.exec(res.data);
            if (!exe_url) {
                if (canLogin) {
                    await this.doLogin();
                    return await this.fetchProxy(false);
                } else {
                    throw new Error('无法获取订阅链接');
                }
            }
            let isCheck = /今日已签到/.test(res.data);
            if (!isCheck) {
                await this.doCheckin();
            } else {
                this.log('今日已签到！');
            }

            res = await axios({
                method: 'get',
                url: exe_url[1]
            });
            let data = yaml.parse(res.data);
            let proxy_arr=data.proxies.map((vo)=>{vo.name='PFVPN-'+vo.name;return vo});
            return proxy_arr;
        }

        async doCheckin() {
            let path = '/user/checkin', method = 'POST';
            let res = await this.doRequest({ path, method });
            this.log('doCheckin info=>');
            this.log(JSON.stringify(res));
            let data='';
            try{
                data=JSON.parse(res.data);
            }catch{
                
            }
            if (data?.msg) {
                this.log('签到成功');
                return true;
            } else {
                this.log('签到失败');
                throw new Error('签到失败');
            }
        }
    }

    function Filter(con) {
        let proxy_arr = con.proxies.filter((vo) => { return !/(内蒙古|江苏|Test|中国)/.test(vo.name) });
        let proxy_name_arr = proxy_arr.map((vo) => { return vo.name });

        let proxy_groups = [
            {
                name: 'Proxy',
                type: 'select',
                proxies: ['自动模式', '手动模式']
            },

            {
                name: '手动模式',
                type: 'select',
                proxies: proxy_name_arr
            },

            {
                name: 'Domestic',
                type: 'select',
                proxies: ['DIRECT', 'Proxy']
            },
            {
                name: 'AsianTV',
                type: 'select',
                proxies: ['Domestic', 'Proxy']
            },
            {
                name: 'GlobalTV',
                type: 'select',
                proxies: ['Proxy']
            },
            {
                name: 'Others',
                type: 'select',
                proxies: ['Proxy', 'Domestic']
            },
            {
                name: '自动模式',
                type: 'url-test',
                url: 'http://cp.cloudflare.com/generate_204',
                interval: 5,
                proxies: proxy_arr.map((vo) => { return vo.name })
            },
        ];
        const extra = {
            proxies: proxy_arr,
            'proxy-groups': proxy_groups,
        };
        return { ...con, ...extra };
    }


    let proxy_arr = []
    let vv = new PFVPN();
    vv.log('');
    vv.log('START 开始JS解析配置文件');
    try {
        proxy_arr = await vv.fetchProxy();
        let proxy_arr_str = JSON.stringify(proxy_arr);
        $fs.writeFileSync(vv.proxy_file, proxy_arr_str);
        vv.log('解析前PFVPN的PROXY=>');
        vv.log(proxy_arr_str)
    } catch (error) {
        vv.log(error);
        vv.log('解析PFVPN数据失败，从缓存获取');
        if ($fs.existsSync(vv.proxy_file)) {
            try {
                proxy_arr = JSON.parse($fs.readFileSync(vv.proxy_file).toString());
            } catch (err) {
                vv.log('JSON解析PFVPN数据错误' + err);
            }
        }
        if (proxy_arr.length > 0) {
            vv.log('获取PFVPN缓存数据成功');
        } else {
            vv.log('解析FVPN数据失败，请刷新后再试');
            vv.log('END 结束JS解析配置文件');
            throw new Error('解析FVPN数据失败，请刷新后再试');
        }
    }
    content.proxies = [...content.proxies, ...proxy_arr];
    let result = Filter(content);
    vv.log('解析FVPN数据成功，解析后的PROXY=>');
    vv.log(JSON.stringify(result.proxies))
    vv.log('END 结束JS解析配置文件');
    return result;
}
