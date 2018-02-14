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

  constructor({ address, family, port, size }: ReferrerOptions = {}) {
    this.address = address;
    this.family = family;
    this.port = port;
    this.size = size;
  }
}