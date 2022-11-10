import fs from "fs";

export class Store {
    static async writeFile(filePath, data, selector:string[] | null = null) {
        try {
            await fs.promises.writeFile(filePath, JSON.stringify(data, selector, 2))
        } catch {
            return '检查路径'
        }
    }

    static async readFile(filePath) {
        try {
            return await fs.promises.readFile(filePath, {encoding: 'utf8'})
        } catch {
            return null;
        }
    }
}
