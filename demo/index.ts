// tslint:disable:no-console

import stw from "../src";
import RemoteService from "../src/RemoteService";

stw
  .on("up", (remoteService: RemoteService) => {
    console.log(`${remoteService.name} is up`);
  })
  .on("down", (remoteService: RemoteService) => {
    console.log(`${remoteService.name} is down`);
  });

stw.listen({
  type: "jsremote"
});

spreadLoop();

async function spreadLoop() {
  const service = await stw.spread({
    name: "remote receiver",
    port: 4444,
    type: "jsremote"
  });

  setTimeout(async () => {
    await service.destroy();

    setTimeout(() => {
      spreadLoop();
    }, 3000);
  }, 3000);
}