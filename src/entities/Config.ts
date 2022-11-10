import { UserAgent } from "../enums/UserAgent";

interface IFake  {
    browser: 'Chrome' | 'Safari' | 'FireFox' | 'Edge'
    platform: "Mac" | "Windows"
}

export class Config {
    public 'user-agent': UserAgent
    constructor(protected fake: IFake, public url: string) {
        if (fake.browser === 'Safari') {
            this["user-agent"] = UserAgent.Safari
        }else {
            this["user-agent"] = UserAgent[fake.platform + fake.browser]
        }
    }
}
