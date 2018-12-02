import { assert } from "chai";
import A from "../src/records/A";
import SRV from "../src/records/SRV";
import TXT from "../src/records/TXT";
import PTR from "../src/records/PTR";
import AAAA from "../src/records/AAAA";
import { WILDCARD } from "../src/Constants";
import { sameRecord } from "../src/MDNSUtils";
import RecordRegistry from "../src/RecordRegistry";

const typeName = "_jsremote._tcp.local";

const serviceName = "Peter's Remote Receiver." + typeName;
const serviceNameAlias = "Mr Peter's Remote Receiver." + typeName;
const hostname = "Peters-MacBook-Pro.local";
const port = 4444;
const ipv6 = "fe80::4a9:610b:1321:995f";
const ipv4 = "192.168.1.50";

const serviceName2 = "Simon's Remote Receiver." + typeName;
const hostname2 = "Simons-MacBook-Pro.local";
const port2 = 4441;
const ipv62 = "fe80::4a9:610b:1321:992f";
const ipv42 = "192.168.1.51";

describe("RecordRegistry", () => {
  const recordRegistry = new RecordRegistry();

  beforeEach(() => {
    recordRegistry.add(new PTR({ name: WILDCARD, data: typeName }));

    recordRegistry.add(new PTR({ name: typeName, data: serviceNameAlias }));
    recordRegistry.add(new PTR({ name: serviceNameAlias, data: serviceName }));
    recordRegistry.add(new SRV({ name: serviceName, data: { target: hostname, port } }));
    recordRegistry.add(new TXT({ name: serviceName, data: "my TXT" }));
    recordRegistry.add(new AAAA({ name: hostname, data: ipv6 }));
    recordRegistry.add(new A({ name: hostname, data: ipv4 }));

    recordRegistry.add(new PTR({ name: typeName, data: serviceName2 }));
    recordRegistry.add(new SRV({ name: serviceName2, data: { target: hostname2, port: port2 } }));
    recordRegistry.add(new TXT({ name: serviceName2, data: "my TXT 2" }));
    recordRegistry.add(new AAAA({ name: hostname2, data: ipv62 }));
    recordRegistry.add(new A({ name: hostname2, data: ipv42 }));
  });

  afterEach(() => {
    recordRegistry.removeAll();
  });

  describe("recordRegistry.find(fn)", () => {
    it("keeps house", async () => {
      recordRegistry.add(new PTR({ name: "dead", data: "dead", ttl: 0.05 }));

      await new Promise(resolve => setTimeout(() => resolve(), 60));

      assert.lengthOf(recordRegistry.find(x => x.name === "dead"), 0);
    });
  });

  describe("recordRegistry.add(record)", () => {
    it("adds record to recordRegistry", () => {
      const newRecord = new PTR({ name: "new", data: "new", ttl: 120 });
      recordRegistry.add(newRecord);

      assert.exists(recordRegistry.findOne(x => x.name === "new" && x.data === "new"));
    });

    it("overwrites record in recordRegistry", () => {
      const newRecord = new PTR({ name: "new", data: "new", ttl: 120 });
      recordRegistry.add(newRecord);

      assert.exists(recordRegistry.findOne(x => sameRecord(x, newRecord)));

      const recordLength = recordRegistry.records.length;
      const newerRecord = new PTR({ name: "new", data: "new", ttl: 222 });
      recordRegistry.add(newerRecord);

      const cachedNewerRecord = recordRegistry.findOne(x => sameRecord(x, newerRecord));
      assert.exists(cachedNewerRecord);
      assert.equal(cachedNewerRecord.ttl, newerRecord.ttl);
      assert.equal(recordLength, recordRegistry.records.length);
    });
  });

  describe("recordRegistry.remove(record)", () => {
    it("removes record from recordRegistry", () => {
      const srvRecord = recordRegistry.findOneSRVByName(serviceName);
      recordRegistry.remove(srvRecord);

      assert.notExists(recordRegistry.findOneSRVByName(serviceName));
    });
  });

  describe("recordRegistry.tracePTR(name)", () => {
    it("returns other records than PTR for given name", () => {
      const records = recordRegistry.tracePTR(WILDCARD);
      for (const record of records) {
        assert.notInstanceOf(record, PTR);
        assert.notEqual(record.type, "PTR");
      }
    });
  });

  describe("recordRegistry.findOneSRVByName(serviceName)", () => {
    it("returns SRV record for given name", () => {
      const record = recordRegistry.findOneSRVByName(serviceName2);

      assert.instanceOf(record, SRV);
      assert.equal(record.type, "SRV");
      assert.equal(record.name, serviceName2);
      assert.equal(record.data.target, hostname2);
      assert.equal(record.data.port, port2);
    });
  });

  describe("recordRegistry.findSRVsByType(typeName)", () => {
    it("returns SRV records for given type", () => {
      const records = recordRegistry.findSRVsByType(typeName);
      assert.lengthOf(records, 2);

      for (const record of records) {
        assert.instanceOf(record, SRV);
        assert.equal(record.type, "SRV");
      }

      assert.equal(records[0].name, serviceName);
      assert.equal(records[0].data.target, hostname);
      assert.equal(records[0].data.port, port);

      assert.equal(records[1].name, serviceName2);
      assert.equal(records[1].data.target, hostname2);
      assert.equal(records[1].data.port, port2);
    });
  });

  describe("recordRegistry.findAddressRecordsByHostname(hostname)", () => {
    it("returns A and AAAA records for given hostname", () => {
      const records = recordRegistry.findAddressRecordsByHostname(hostname);
      assert.lengthOf(records, 2);

      assert.instanceOf(records[0], AAAA);
      assert.equal(records[0].name, hostname);
      assert.equal(records[0].data, ipv6);

      assert.instanceOf(records[1], A);
      assert.equal(records[1].name, hostname);
      assert.equal(records[1].data, ipv4);
    });
  });
});