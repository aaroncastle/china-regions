import { load } from "cheerio";
import { IPages } from "../interfaces/IPage";
import path from "path";
import { Store } from "./Store";
import { axiosInstance } from "./Fetch";
import { AxiosResponse } from "axios";
import { IRegion } from "../interfaces/IRegion";
import { IProvince } from "../interfaces/IProvince";


export class Spider {
    static async get(url): Promise<AxiosResponse> {
        return await axiosInstance.get(url)
    }

    static async getProvincePage(url = '/', selector = '.provincetr'): Promise<IPages[]> {
        const filePath = path.resolve(__filename, '../../asset/provincePage.json')
        const provincePathList = await Store.readFile(filePath)
        if (provincePathList && url === '/') {
            return JSON.parse(provincePathList)
        } else {
            const provincePage: IPages[] = []
            const result = await this.get(url)
            const $ = load(result.data)
            const provinces = $(selector)
            for (const province of provinces) {
                const temp = $('a', province)
                for (const element of temp) {
                    provincePage.push({
                        region: $(element).html()?.replace(/<br>/, ''),
                        page: '/' + element.attribs.href
                    } as IPages)
                }
            }
            if (url === '/') {
                await Store.writeFile(filePath, provincePage)
            }
            return provincePage
        }
    }

    static async getCities(): Promise<IProvince[]> {
        const val = await Store.readFile(path.resolve(__filename, '../../asset/provincePage.json'))
        let pageList: IPages[];
        if (val) {
            pageList = JSON.parse(val) as IPages[]
        } else {
            pageList = await this.getProvincePage()
        }
        const provinces: IRegion[] = []
        const citiesPath = path.resolve(__filename, '../../asset/citiesPage.json')
        const citiesPage = await Store.readFile(citiesPath)
        const citiesData: IProvince[] = []
        for (const iPage of pageList) {
            const result = await this.get(iPage.page)
            const province: IRegion = {} as IRegion
            const $ = load(result.data)
            const ls = $('.citytr')
            const cities: IRegion[] = []
            for (const l of ls) {
                const city: IRegion = {} as IRegion
                let pubCode
                $("a", l).each((i, item) => {
                    const publish: IPages = {} as IPages

                    if (Object.is(i, 0)) {
                        city.code = $(item).html() as string
                        const code = pubCode = city.code.replace(/\d/g, (it, index) => index < 2 ? it : '0')
                        const temp = citiesData.find(iterm => iterm.province === code)
                        publish.region = city.code
                        publish.page = '/' + $(item).attr()?.href
                        if (!temp) {
                            citiesData.push({
                                province: code,
                                cities: [ publish ]
                            })
                        } else {
                            const re = temp.cities.find(cityJson => cityJson.region === city.code)
                            if (!re) {
                                temp.cities.push(publish)
                            }
                        }
                    }
                    if (Object.is(i, 1)) {
                        if (Object.is($(item).html(), '市辖区')) {
                            city.name = iPage.region
                        } else if (Object.is($(item).html(), '省直辖县级行政区划') || Object.is($(item).html(), '自治区直辖县级行政区划')) {
                            /* 如果是省辖市 需要深度处理*/
                            /* 清除上个记录的省辖市 */
                            const temp = citiesData.find(pc => pc.province === pubCode)
                            if (temp) {
                                temp.cities = temp.cities.filter(cy => cy.page !== '/' + $(item).attr()?.href)
                            }
                            /* 直接请求省辖市 */
                            this.getProvincePage('/' + $(item).attr()?.href, '.countytr').then(r => {
                                /* 请求得到的省辖市更换地址 */
                                r.forEach(reg => {
                                    reg.page = '/' + $(item).attr()?.href.replace(/\/\d*\.html$/, reg.page) || ''
                                })
                                const codeCity = r.filter(it => /\d/.test(it.region))
                                const codeName = r.filter(it => /[\u4e00-\u9fa5]/.test(it.region))
                                for (let j = 0; j < codeCity.length; j++) {
                                    city.name = codeName[j].region
                                    city.code = codeCity[j].region
                                }
                                const target = citiesData.find(it => it.province === codeCity[0].region.replace(/\d/g, (iterm, index) => index < 2 ? iterm : '0'))
                                if (target) {
                                    target.cities.push(...codeCity)
                                } else {
                                    citiesData.push({
                                        province: codeCity[0].region.replace(/\d/g, (iterm, index) => index < 2 ? iterm : '0'),
                                        cities: [ ...codeCity ]
                                    })
                                }
                            })
                        } else {
                            city.name = $(item).html() as string
                        }
                    }
                })
                cities.push(city)
            }
            province.name = iPage.region.replace(/市$/, '')
            province.children = cities
            province.code = province.children[0].code.replace(/\d/g, (it, index) => index < 2 ? it : '0')
            provinces.push(province)
        }
        if (!citiesPage) {
            await Store.writeFile(citiesPath, citiesData)
        }
        const value = await Store.readFile(path.resolve(__filename, '../../regions/provinces.json'))
        if (!value) {
            await Store.writeFile(path.resolve(__filename, '../../regions/provinces.json'), provinces, [ 'name', 'code' ])
            await Store.writeFile(path.resolve(__filename, '../../regions/cities.json'), provinces)
        }
        return citiesData
    }

    static async getCitiesPage(): Promise<IPages[]> {
        const val = await Store.readFile(path.resolve(__filename, '../../asset/citiesPage.json'))
        let citiesPage: IPages[]
        if (val) {
            const temp: IProvince[] = JSON.parse(val)
            citiesPage = temp.reduce((prev, item) => item.cities.concat(prev), [])
        } else {
            citiesPage = (await this.getCities()).reduce((prev, item) => [ ...item.cities, ...prev ], [])
        }
        return citiesPage
    }

    static async getCounties(): Promise<IRegion[]> {
        const citiesFile = await Store.readFile(path.resolve(__filename, '../../regions/counties.json'))
        if (citiesFile) {
            return JSON.parse(citiesFile)
        }
        const queryList = await this.getCitiesPage();
        const result = await (Store.readFile(path.resolve(__filename, '../../regions/cities.json')))
        let cities;
        if (result) {
            cities = JSON.parse(result as string).reduce((prev, item) => [ ...item.children, ...prev ], [])
        } else {
            await this.getCities();
            const tem = await (Store.readFile(path.resolve(__filename, '../../regions/cities.json')))
            cities = JSON.parse(tem as string).reduce((prev, item) => [ ...item.children, ...prev ], [])
        }
        for await (const city of cities as IRegion[]) {
            const url = queryList.find(item => item.region === city.code)?.page
            const response = await this.get(url)
            const $ = load(response.data)
            let counties = $('.countytr').has('td a')
            if (!counties.length) {
                counties =$('.towntr').has('td a')
            }
            city.children = []
            for await (const county of counties) {
                const temp: IRegion = {} as IRegion
                $('a', county).each((i, item) => {
                    if (Object.is(i, 0)) {
                        temp.code = $(item).html() as string
                    }
                    if (Object.is(i, 1)) {
                        temp.name = $(item).html() as string
                    }
                })
                city.children.push(temp)
                console.log(temp.name + '  爬取完成')
            }
            console.log(city.name + '  所有区县爬取完成' + '等待 1 秒用于伪装正常浏览')
            await this.delay();
        }
        cities.sort((a, b) => a.code - b.code)
        if (!citiesFile) {
            await Store.writeFile(path.resolve(__filename, '../../regions/counties.json'), cities)
        }
        return cities
    }

    static delay(during = 1000): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, during)
        })
    }
}
