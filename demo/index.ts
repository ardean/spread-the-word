// tslint:disable:no-console

import stw, { RemoteService, Response, Referrer } from "../src";

stw.init({
  transportOptions: {
    binaryTXT: false // true for Buffer TXT props
  }
});

stw
  .on("up", (remoteService: RemoteService, res: Response, referrer: Referrer) => {
    console.log(`${remoteService.name} (type: ${remoteService.type}, port: ${remoteService.port}) is up (from ${referrer.address})`);
    if (remoteService.txt) console.log("TXT found:", remoteService.txt);
  })
  .on("down", (remoteService: RemoteService, res: Response, referrer: Referrer) => {
    console.log(`${remoteService.name} (type: ${remoteService.type}, port: ${remoteService.port}) is down (from ${referrer.address})`);
  });

stw.listen();

spreadLoop(0);

async function spreadLoop(index: number) {
  const service = await stw.spread({
    name: "remote receiver",
    port: 4444,
    type: "jsremote",
    txt: {
      message: `Hello ${++index}`
    }
  });

  setTimeout(async () => {
    await service.destroy();

    setTimeout(() => {
      spreadLoop(index);
    }, 3000);
  }, 3000);
}