import { Spider } from "./entities/Spider";


Spider.getCounties().then(_ => {
    console.log('所有数据爬取完成，数据保存在 regions 文件夹中')
})

