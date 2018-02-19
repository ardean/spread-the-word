// tslint:disable:no-console

import stw, { RemoteService, Response, Referrer } from "../src";

stw.init({
  transportOptions: {
    binaryTXT: false // true for Buffer TXT props
  }
});

stw
  .on("up", (remoteService: RemoteService, res: Response, referrer: Referrer) => {
    console.log(`${remoteService.name} is up (from ${referrer.address})`);
    if (remoteService.txt) console.log("TXT found:", remoteService.txt.message);
  })
  .on("down", (remoteService: RemoteService, res: Response, referrer: Referrer) => {
    console.log(`${remoteService.name} is down (from ${referrer.address})`);
    if (remoteService.txt) console.log("TXT found:", remoteService.txt.message);
  });

stw.listen({
  type: "jsremote"
});

spreadLoop(0);

async function spreadLoop(index) {
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