/**
 * 统一处理api数据
 * lib/proxy可以代理访问api的方法
 * 使用：const data = await this.$serv.opList();
*/
import API from 'api';
import Proxy from 'lib/proxy';

export default Proxy({
    async opList(params) {
        return {
            list: await API.opList(params)
        };
    },
    opDetail(params) {
        return API.opDetail(params);
    }
}, API);
