import os from "os";
import A from "./records/A";
import dnsTxt from "dns-txt";
import TXT from "./records/TXT";
import SRV from "./records/SRV";
import PTR from "./records/PTR";
import AAAA from "./records/AAAA";
import Record from "./records/Record";

export interface MDNSNameOptions {
  name?: string;
  subtypes?: string[];
  type?: string;
  protocol?: string;
  domain?: string;
}

export function serializeDNSName(options: MDNSNameOptions) {
  const subtypes = (options.subtypes || [])
    .filter(x => x)
    .map(subtype => "_" + subtype)
    .join(".");
  return [
    options.name,
    subtypes,
    options.type ? "_" + options.type : "",
    options.protocol ? "_" + options.protocol : "",
    options.domain
  ]
    .filter(x => x)
    .join(".");
}

export function parseDNSName(dnsName: string): MDNSNameOptions {
  let name = "";
  let domain = "";
  const parts = dnsName.split(".");
  const prefixed: string[] = [];
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (part[0] === "_") {
      prefixed.push(part.substr(1));
      continue;
    }
    if (index === parts.length - 1) {
      domain = part;
      continue;
    }
    name += part;
  }

  const subtypes = prefixed.slice(0, prefixed.length - 2);
  return {
    name,
    subtypes,
    type: prefixed[prefixed.length - 2],
    protocol: prefixed[prefixed.length - 1],
    domain
  };
}

export function sameRecord(a: Record, b: Record) {
  if (a.type !== b.type) return false;
  if (a.name !== b.name) return false;
  if (typeof a.data !== typeof b.data) return false;
  if (a.type === "SRV" && (a.data.target !== b.data.target || a.data.port !== b.data.port)) return false;
  if (a.type !== "SRV" && a.type !== "TXT" && a.data !== b.data) return false;

  return true;
}

export function getExternalAddresses() {
  const interfaceMap = os.networkInterfaces();
  const interfaceNames = Object.keys(interfaceMap);

  const addresses: Array<{ family: string, address: string }> = [];
  for (const interfaceName of interfaceNames) {
    const interfaces = interfaceMap[interfaceName];
    for (const { internal, family, address } of interfaces) {
      if (internal) continue;
      addresses.push({
        family,
        address
      });
    }
  }

  return addresses;
}

export function parseRecord(record, options: { binaryTXT?: boolean } = {}) {
  if (record.type === "PTR") return new PTR(record);
  if (record.type === "TXT") return TXT.parse(record, { binary: options.binaryTXT });
  if (record.type === "SRV") return new SRV(record);
  if (record.type === "AAAA") return new AAAA(record);
  if (record.type === "A") return new A(record);

  return null;
}

export function serializeRecord(record, options: { binaryTXT?: boolean } = {}) {
  if (record.type === "PTR") return new PTR(record);
  if (record.type === "TXT") return TXT.serialize(record, { binary: options.binaryTXT });
  if (record.type === "SRV") return new SRV(record);
  if (record.type === "AAAA") return new AAAA(record);
  if (record.type === "A") return new A(record);

  return null;
}

export interface TXTData {
  [key: string]: string | Buffer;
}

export function parseTXTData(data: Buffer, options: { binary?: boolean } = { binary: false }) {
  const result = dnsTxt({ binary: options.binary }).decode(data) as TXTData;
  return Object.keys(result).length > 0 ? result : null;
}

export function serializeTXTData(data: TXTData, options: { binary?: boolean } = { binary: false }) {
  return dnsTxt({ binary: options.binary }).encode(data) as Buffer;
}