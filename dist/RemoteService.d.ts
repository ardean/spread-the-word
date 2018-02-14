import SRV from "./Records/SRV";
export default class RemoteService {
    name: string;
    hostname: string;
    port: number;
    constructor(record: SRV);
}
