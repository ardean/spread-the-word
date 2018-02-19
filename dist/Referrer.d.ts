export interface ReferrerOptions {
    address?: string;
    family?: string;
    port?: number;
    size?: number;
}
export default class Referrer {
    address: string;
    family: string;
    port: number;
    size: number;
    ownAddress: boolean;
    constructor({address, family, port, size}?: ReferrerOptions);
}
