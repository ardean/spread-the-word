import * as os from "os";
import Record from "./Records/Record";
import PTR from "./Records/PTR";
import TXT from "./Records/TXT";
import SRV from "./Records/SRV";
import AAAA from "./Records/AAAA";
import A from "./Records/A";

export interface MDNSNameOptions {
  name?: string;
  subtypes?: string[];
  type?: string;
  protocol?: string;
  domain?: string;
}

export function stringifyDNSName(options: MDNSNameOptions) {
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
  let domain;
  const parts = dnsName.split(".");
  const prefixed = [];
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

  const addresses = [];
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

export function parseRecord(record) {
  if (record.type === "PTR") return new PTR(record);
  if (record.type === "TXT") return new TXT(record);
  if (record.type === "SRV") return new SRV(record);
  if (record.type === "AAAA") return new AAAA(record);
  if (record.type === "A") return new A(record);

  return null;
}