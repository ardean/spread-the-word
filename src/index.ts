export { default as Server } from "./Server";
export { default as Query } from "./Query";
export { default as Question } from "./Question";
export { default as Response } from "./Response";
export { default as Referrer } from "./Referrer";
export { default as RemoteService } from "./RemoteService";
export { default as Service } from "./Service";
export { default as Listener } from "./Listener";
export { default as SpreadTheWord } from "./SpreadTheWord";

import * as Records from "./Records";
import * as Transports from "./Transports";
import * as MDNSUtils from "./MDNSUtils";
export {
  Records,
  Transports,
  MDNSUtils
};

import SpreadTheWord from "./SpreadTheWord";
export default new SpreadTheWord();
