export { default as Server, ServerOptions } from "./Server";
export { default as Query, QueryOptions } from "./Query";
export { default as Question } from "./Question";
export { default as Response, ResponseOptions } from "./Response";
export { default as Referrer, ReferrerOptions } from "./Referrer";
export { default as RemoteService } from "./RemoteService";
export { default as Service, ServiceOptions } from "./Service";
export { default as Listener, ListenerOptions } from "./Listener";
export { default as RecordRegistry } from "./RecordRegistry";
export { default as SpreadTheWord, StatusType } from "./SpreadTheWord";

import * as records from "./records";
import * as transports from "./transports";
import * as MDNSUtil from "./MDNSUtil";
export {
  records,
  transports,
  MDNSUtil
};

import SpreadTheWord from "./SpreadTheWord";
export default new SpreadTheWord();
