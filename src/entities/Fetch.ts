import axios from "axios";
import { config } from "../config";

const axiosInstance = axios.create();


axiosInstance.interceptors.request.use(req => {
    req.baseURL = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2021';
    req['User-Agent'] = config['user-agent'];
    return req
}, error => Promise.reject('发送失败，请检查网络'))

export { axiosInstance }
