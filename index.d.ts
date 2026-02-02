/**
 * TypeScript definitions for ari-client
 * JavaScript client for Asterisk REST Interface
 */

import { EventEmitter } from 'events';

/**
 * Connect to an ARI server
 */
export function connect(
  baseUrl: string,
  user: string,
  pass: string,
  callback?: (err: Error | null, client: Client) => void
): Promise<Client>;

/**
 * Connection settings for an ARI instance
 */
export interface Connection {
  protocol: string;
  host: string;
  hostname: string;
  prefix: string;
  user: string;
  pass: string;
}

/**
 * ARI Client
 */
export interface Client extends EventEmitter {
  _connection: Connection;
  _instanceListeners: Record<string, InstanceListener[]>;
  _swagger: SwaggerApi;
  _ws: WebSocket;
  _wsClosed: boolean;

  // Resource APIs
  asterisk: AsteriskResource;
  applications: ApplicationsResource;
  bridges: BridgesResource;
  channels: ChannelsResource;
  deviceStates: DeviceStatesResource;
  endpoints: EndpointsResource;
  events: EventsResource;
  mailboxes: MailboxesResource;
  playbacks: PlaybacksResource;
  recordings: RecordingsResource;
  sounds: SoundsResource;

  // Resource instance creators
  Application(id?: string, values?: Partial<Application>): Application;
  Asterisk(values?: Partial<Asterisk>): Asterisk;
  Bridge(id?: string, values?: Partial<Bridge>): Bridge;
  Channel(id?: string, values?: Partial<Channel>): Channel;
  DeviceState(id?: string, values?: Partial<DeviceState>): DeviceState;
  Endpoint(id?: EndpointId, values?: Partial<Endpoint>): Endpoint;
  LiveRecording(id?: string, values?: Partial<LiveRecording>): LiveRecording;
  Mailbox(id?: string, values?: Partial<Mailbox>): Mailbox;
  Playback(id?: string, values?: Partial<Playback>): Playback;
  Sound(id?: string, values?: Partial<Sound>): Sound;
  StoredRecording(id?: string, values?: Partial<StoredRecording>): StoredRecording;

  /**
   * Start the WebSocket connection for receiving events
   */
  start(
    apps: string | string[],
    subscribeAll?: boolean | ((err: Error | null) => void),
    callback?: (err: Error | null) => void
  ): Promise<void>;

  /**
   * Stop the WebSocket connection
   */
  stop(): void;

  /**
   * Ping the WebSocket connection
   */
  ping(): void;
}

export interface InstanceListener {
  once: boolean;
  id: string;
  callback: (...args: any[]) => void;
}

export interface SwaggerApi {
  ready: boolean;
  apis: Record<string, SwaggerResource>;
}

export interface SwaggerResource {
  operations: Record<string, SwaggerOperation>;
  models: Record<string, SwaggerModel>;
  rawModels: Record<string, any>;
}

export interface SwaggerOperation {
  type: string | null;
  summary: string;
  parameters: SwaggerParameter[];
  resourceName: string;
}

export interface SwaggerParameter {
  name: string;
  paramType: 'path' | 'query' | 'body';
  required: boolean;
  dataType: string;
  description?: string;
}

export interface SwaggerModel {
  id: string;
  description: string;
  properties: Record<string, SwaggerModelProperty>;
}

export interface SwaggerModelProperty {
  name: string;
  dataType: string;
  description: string;
  descr: string;
  required: boolean;
}

// ============================================================================
// Resource Types
// ============================================================================

export interface Resource extends EventEmitter {
  _client: Client;
  _generatedId?: boolean;
  _id(value?: string): string | void;
  _param: string | string[];
  _resource: string;
  generateId(): void;
}

export interface EndpointId {
  tech: string;
  resource: string;
  toString(): string;
}

// ============================================================================
// Application
// ============================================================================

export interface Application extends Resource {
  name: string;
  channel_ids: string[];
  bridge_ids: string[];
  endpoint_ids: string[];
  device_names: string[];
  events_allowed: EventTypeMapping[];
  events_disallowed: EventTypeMapping[];

  // Operations
  get(callback?: Callback<Application>): Promise<Application>;
  subscribe(options: { eventSource: string | string[] }, callback?: Callback<Application>): Promise<Application>;
  unsubscribe(options: { eventSource: string | string[] }, callback?: Callback<Application>): Promise<Application>;
  filter(options?: { filter?: EventTypeMapping[] }, callback?: Callback<Application>): Promise<Application>;
}

export interface EventTypeMapping {
  type: string;
  allowed: boolean;
}

export interface ApplicationsResource {
  list(callback?: Callback<Application[]>): Promise<Application[]>;
  get(options: { applicationName: string }, callback?: Callback<Application>): Promise<Application>;
  subscribe(options: { applicationName: string; eventSource: string | string[] }, callback?: Callback<Application>): Promise<Application>;
  unsubscribe(options: { applicationName: string; eventSource: string | string[] }, callback?: Callback<Application>): Promise<Application>;
  filter(options: { applicationName: string; filter?: EventTypeMapping[] }, callback?: Callback<Application>): Promise<Application>;
}

// ============================================================================
// Asterisk
// ============================================================================

export interface Asterisk extends Resource {
  // Operations
  getInfo(options?: { only?: string | string[] }, callback?: Callback<AsteriskInfo>): Promise<AsteriskInfo>;
  ping(callback?: Callback<AsteriskPing>): Promise<AsteriskPing>;
  listModules(callback?: Callback<Module[]>): Promise<Module[]>;
  getModule(options: { moduleName: string }, callback?: Callback<Module>): Promise<Module>;
  loadModule(options: { moduleName: string }, callback?: Callback<void>): Promise<void>;
  unloadModule(options: { moduleName: string }, callback?: Callback<void>): Promise<void>;
  reloadModule(options: { moduleName: string }, callback?: Callback<void>): Promise<void>;
  listLogChannels(callback?: Callback<LogChannel[]>): Promise<LogChannel[]>;
  addLog(options: { logChannelName: string; configuration: string }, callback?: Callback<void>): Promise<void>;
  deleteLog(options: { logChannelName: string }, callback?: Callback<void>): Promise<void>;
  rotateLog(options: { logChannelName: string }, callback?: Callback<void>): Promise<void>;
  getGlobalVar(options: { variable: string }, callback?: Callback<Variable>): Promise<Variable>;
  setGlobalVar(options: { variable: string; value?: string }, callback?: Callback<void>): Promise<void>;
}

export interface AsteriskInfo {
  build?: BuildInfo;
  system?: SystemInfo;
  config?: ConfigInfo;
  status?: StatusInfo;
}

export interface BuildInfo {
  os: string;
  kernel: string;
  options: string;
  machine: string;
  date: string;
  user: string;
}

export interface SystemInfo {
  version: string;
  entity_id: string;
}

export interface ConfigInfo {
  name: string;
  default_language: string;
  max_channels?: number;
  max_open_files?: number;
  max_load?: number;
  setid: SetId;
}

export interface SetId {
  user: string;
  group: string;
}

export interface StatusInfo {
  startup_time: string;
  last_reload_time: string;
}

export interface AsteriskPing {
  asterisk_id: string;
  ping: string;
  timestamp: string;
}

export interface Module {
  name: string;
  description: string;
  use_count: number;
  status: string;
  support_level: string;
}

export interface LogChannel {
  channel: string;
  type: string;
  status: string;
  configuration: string;
}

export interface Variable {
  value: string;
}

export interface AsteriskResource {
  getInfo(options?: { only?: string | string[] }, callback?: Callback<AsteriskInfo>): Promise<AsteriskInfo>;
  ping(callback?: Callback<AsteriskPing>): Promise<AsteriskPing>;
  listModules(callback?: Callback<Module[]>): Promise<Module[]>;
  getModule(options: { moduleName: string }, callback?: Callback<Module>): Promise<Module>;
  loadModule(options: { moduleName: string }, callback?: Callback<void>): Promise<void>;
  unloadModule(options: { moduleName: string }, callback?: Callback<void>): Promise<void>;
  reloadModule(options: { moduleName: string }, callback?: Callback<void>): Promise<void>;
  listLogChannels(callback?: Callback<LogChannel[]>): Promise<LogChannel[]>;
  addLog(options: { logChannelName: string; configuration: string }, callback?: Callback<void>): Promise<void>;
  deleteLog(options: { logChannelName: string }, callback?: Callback<void>): Promise<void>;
  rotateLog(options: { logChannelName: string }, callback?: Callback<void>): Promise<void>;
  getGlobalVar(options: { variable: string }, callback?: Callback<Variable>): Promise<Variable>;
  setGlobalVar(options: { variable: string; value?: string }, callback?: Callback<void>): Promise<void>;
}

// ============================================================================
// Bridge
// ============================================================================

export interface Bridge extends Resource {
  id: string;
  technology: string;
  bridge_type: string;
  bridge_class: string;
  creator: string;
  name: string;
  channels: string[];
  video_mode?: string;
  video_source_id?: string;
  creationtime: string;

  // Operations
  create(options?: BridgeCreateOptions, callback?: Callback<Bridge>): Promise<Bridge>;
  createWithId(options?: BridgeCreateOptions, callback?: Callback<Bridge>): Promise<Bridge>;
  get(callback?: Callback<Bridge>): Promise<Bridge>;
  destroy(callback?: Callback<void>): Promise<void>;
  addChannel(options: { channel: string | string[]; role?: string; absorbDTMF?: boolean; mute?: boolean }, callback?: Callback<void>): Promise<void>;
  removeChannel(options: { channel: string | string[] }, callback?: Callback<void>): Promise<void>;
  setVideoSource(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  clearVideoSource(callback?: Callback<void>): Promise<void>;
  startMoh(options?: { mohClass?: string }, callback?: Callback<void>): Promise<void>;
  stopMoh(callback?: Callback<void>): Promise<void>;
  play(options: PlayOptions, playback?: Playback, callback?: Callback<Playback>): Promise<Playback>;
  playWithId(options: PlayOptions & { playbackId: string }, callback?: Callback<Playback>): Promise<Playback>;
  record(options: RecordOptions, liveRecording?: LiveRecording, callback?: Callback<LiveRecording>): Promise<LiveRecording>;
}

export interface BridgeCreateOptions {
  type?: string;
  bridgeId?: string;
  name?: string;
}

export interface BridgesResource {
  list(callback?: Callback<Bridge[]>): Promise<Bridge[]>;
  create(options?: BridgeCreateOptions, callback?: Callback<Bridge>): Promise<Bridge>;
  createWithId(options: BridgeCreateOptions & { bridgeId: string }, callback?: Callback<Bridge>): Promise<Bridge>;
  get(options: { bridgeId: string }, callback?: Callback<Bridge>): Promise<Bridge>;
  destroy(options: { bridgeId: string }, callback?: Callback<void>): Promise<void>;
  addChannel(options: { bridgeId: string; channel: string | string[]; role?: string; absorbDTMF?: boolean; mute?: boolean }, callback?: Callback<void>): Promise<void>;
  removeChannel(options: { bridgeId: string; channel: string | string[] }, callback?: Callback<void>): Promise<void>;
  setVideoSource(options: { bridgeId: string; channelId: string }, callback?: Callback<void>): Promise<void>;
  clearVideoSource(options: { bridgeId: string }, callback?: Callback<void>): Promise<void>;
  startMoh(options: { bridgeId: string; mohClass?: string }, callback?: Callback<void>): Promise<void>;
  stopMoh(options: { bridgeId: string }, callback?: Callback<void>): Promise<void>;
  play(options: { bridgeId: string } & PlayOptions, callback?: Callback<Playback>): Promise<Playback>;
  playWithId(options: { bridgeId: string; playbackId: string } & PlayOptions, callback?: Callback<Playback>): Promise<Playback>;
  record(options: { bridgeId: string } & RecordOptions, callback?: Callback<LiveRecording>): Promise<LiveRecording>;
}

// ============================================================================
// Channel
// ============================================================================

export interface Channel extends Resource {
  id: string;
  name: string;
  state: string;
  caller: CallerID;
  connected: CallerID;
  accountcode: string;
  dialplan: DialplanCEP;
  creationtime: string;
  language: string;
  channelvars?: Record<string, string>;

  // Operations
  originate(options: OriginateOptions, callback?: Callback<Channel>): Promise<Channel>;
  originateWithId(options: OriginateOptions, callback?: Callback<Channel>): Promise<Channel>;
  create(options: CreateChannelOptions, callback?: Callback<Channel>): Promise<Channel>;
  get(callback?: Callback<Channel>): Promise<Channel>;
  hangup(options?: { reason_code?: string; reason?: string }, callback?: Callback<void>): Promise<void>;
  continueInDialplan(options?: { context?: string; extension?: string; priority?: number; label?: string }, callback?: Callback<void>): Promise<void>;
  move(options: { app: string; appArgs?: string }, callback?: Callback<void>): Promise<void>;
  redirect(options: { endpoint: string }, callback?: Callback<void>): Promise<void>;
  answer(callback?: Callback<void>): Promise<void>;
  ring(callback?: Callback<void>): Promise<void>;
  ringStop(callback?: Callback<void>): Promise<void>;
  sendDTMF(options: { dtmf: string; before?: number; between?: number; duration?: number; after?: number }, callback?: Callback<void>): Promise<void>;
  mute(options?: { direction?: 'both' | 'in' | 'out' }, callback?: Callback<void>): Promise<void>;
  unmute(options?: { direction?: 'both' | 'in' | 'out' }, callback?: Callback<void>): Promise<void>;
  hold(callback?: Callback<void>): Promise<void>;
  unhold(callback?: Callback<void>): Promise<void>;
  startMoh(options?: { mohClass?: string }, callback?: Callback<void>): Promise<void>;
  stopMoh(callback?: Callback<void>): Promise<void>;
  startSilence(callback?: Callback<void>): Promise<void>;
  stopSilence(callback?: Callback<void>): Promise<void>;
  play(options: PlayOptions, playback?: Playback, callback?: Callback<Playback>): Promise<Playback>;
  playWithId(options: PlayOptions & { playbackId: string }, callback?: Callback<Playback>): Promise<Playback>;
  record(options: RecordOptions, liveRecording?: LiveRecording, callback?: Callback<LiveRecording>): Promise<LiveRecording>;
  getChannelVar(options: { variable: string }, callback?: Callback<Variable>): Promise<Variable>;
  setChannelVar(options: { variable: string; value?: string }, callback?: Callback<void>): Promise<void>;
  snoopChannel(options: SnoopOptions, snoopChannel?: Channel, callback?: Callback<Channel>): Promise<Channel>;
  snoopChannelWithId(options: SnoopOptions & { snoopId: string }, callback?: Callback<Channel>): Promise<Channel>;
  dial(options?: { caller?: string; timeout?: number }, callback?: Callback<void>): Promise<void>;
  externalMedia(options: ExternalMediaOptions, callback?: Callback<Channel>): Promise<Channel>;
}

export interface CallerID {
  name: string;
  number: string;
}

export interface DialplanCEP {
  context: string;
  exten: string;
  priority: number;
  app_name?: string;
  app_data?: string;
}

export interface OriginateOptions {
  endpoint: string;
  extension?: string;
  context?: string;
  priority?: number;
  label?: string;
  app?: string;
  appArgs?: string;
  callerId?: string;
  timeout?: number;
  channelId?: string;
  otherChannelId?: string;
  originator?: string;
  formats?: string;
  variables?: Record<string, string>;
}

export interface CreateChannelOptions {
  endpoint: string;
  app: string;
  appArgs?: string;
  channelId?: string;
  otherChannelId?: string;
  originator?: string;
  formats?: string;
}

export interface PlayOptions {
  media: string | string[];
  lang?: string;
  offsetms?: number;
  skipms?: number;
  playbackId?: string;
}

export interface RecordOptions {
  name: string;
  format: string;
  maxDurationSeconds?: number;
  maxSilenceSeconds?: number;
  ifExists?: 'fail' | 'overwrite' | 'append';
  beep?: boolean;
  terminateOn?: string;
}

export interface SnoopOptions {
  app: string;
  spy?: 'none' | 'both' | 'out' | 'in';
  whisper?: 'none' | 'both' | 'out' | 'in';
  appArgs?: string;
  snoopId?: string;
}

export interface ExternalMediaOptions {
  app: string;
  external_host: string;
  encapsulation?: string;
  transport?: string;
  connection_type?: string;
  format: string;
  direction?: string;
  data?: string;
  variables?: Record<string, string>;
  channelId?: string;
}

export interface ChannelsResource {
  list(callback?: Callback<Channel[]>): Promise<Channel[]>;
  originate(options: OriginateOptions, callback?: Callback<Channel>): Promise<Channel>;
  originateWithId(options: OriginateOptions & { channelId: string }, callback?: Callback<Channel>): Promise<Channel>;
  create(options: CreateChannelOptions, callback?: Callback<Channel>): Promise<Channel>;
  get(options: { channelId: string }, callback?: Callback<Channel>): Promise<Channel>;
  hangup(options: { channelId: string; reason_code?: string; reason?: string }, callback?: Callback<void>): Promise<void>;
  continueInDialplan(options: { channelId: string; context?: string; extension?: string; priority?: number; label?: string }, callback?: Callback<void>): Promise<void>;
  move(options: { channelId: string; app: string; appArgs?: string }, callback?: Callback<void>): Promise<void>;
  redirect(options: { channelId: string; endpoint: string }, callback?: Callback<void>): Promise<void>;
  answer(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  ring(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  ringStop(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  sendDTMF(options: { channelId: string; dtmf: string; before?: number; between?: number; duration?: number; after?: number }, callback?: Callback<void>): Promise<void>;
  mute(options: { channelId: string; direction?: 'both' | 'in' | 'out' }, callback?: Callback<void>): Promise<void>;
  unmute(options: { channelId: string; direction?: 'both' | 'in' | 'out' }, callback?: Callback<void>): Promise<void>;
  hold(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  unhold(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  startMoh(options: { channelId: string; mohClass?: string }, callback?: Callback<void>): Promise<void>;
  stopMoh(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  startSilence(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  stopSilence(options: { channelId: string }, callback?: Callback<void>): Promise<void>;
  play(options: { channelId: string } & PlayOptions, callback?: Callback<Playback>): Promise<Playback>;
  playWithId(options: { channelId: string; playbackId: string } & PlayOptions, callback?: Callback<Playback>): Promise<Playback>;
  record(options: { channelId: string } & RecordOptions, callback?: Callback<LiveRecording>): Promise<LiveRecording>;
  getChannelVar(options: { channelId: string; variable: string }, callback?: Callback<Variable>): Promise<Variable>;
  setChannelVar(options: { channelId: string; variable: string; value?: string }, callback?: Callback<void>): Promise<void>;
  snoopChannel(options: { channelId: string } & SnoopOptions, callback?: Callback<Channel>): Promise<Channel>;
  snoopChannelWithId(options: { channelId: string; snoopId: string } & SnoopOptions, callback?: Callback<Channel>): Promise<Channel>;
  dial(options: { channelId: string; caller?: string; timeout?: number }, callback?: Callback<void>): Promise<void>;
  externalMedia(options: ExternalMediaOptions, callback?: Callback<Channel>): Promise<Channel>;
  rtpStatistics(options: { channelId: string }, callback?: Callback<RTPstat>): Promise<RTPstat>;
}

export interface RTPstat {
  txcount: number;
  rxcount: number;
  txjitter?: number;
  rxjitter?: number;
  remote_maxjitter?: number;
  remote_minjitter?: number;
  remote_normdevjitter?: number;
  remote_stdevjitter?: number;
  local_maxjitter?: number;
  local_minjitter?: number;
  local_normdevjitter?: number;
  local_stdevjitter?: number;
  txploss: number;
  rxploss: number;
  remote_maxrxploss?: number;
  remote_minrxploss?: number;
  remote_normdevrxploss?: number;
  remote_stdevrxploss?: number;
  local_maxrxploss?: number;
  local_minrxploss?: number;
  local_normdevrxploss?: number;
  local_stdevrxploss?: number;
  rtt?: number;
  maxrtt?: number;
  minrtt?: number;
  normdevrtt?: number;
  stdevrtt?: number;
  local_ssrc: number;
  remote_ssrc?: number;
  txoctetcount: number;
  rxoctetcount: number;
  channel_uniqueid: string;
}

// ============================================================================
// DeviceState
// ============================================================================

export interface DeviceState extends Resource {
  name: string;
  state: string;

  // Operations
  get(callback?: Callback<DeviceState>): Promise<DeviceState>;
  update(options: { deviceState: string }, callback?: Callback<void>): Promise<void>;
  delete(callback?: Callback<void>): Promise<void>;
}

export interface DeviceStatesResource {
  list(callback?: Callback<DeviceState[]>): Promise<DeviceState[]>;
  get(options: { deviceName: string }, callback?: Callback<DeviceState>): Promise<DeviceState>;
  update(options: { deviceName: string; deviceState: string }, callback?: Callback<void>): Promise<void>;
  delete(options: { deviceName: string }, callback?: Callback<void>): Promise<void>;
}

// ============================================================================
// Endpoint
// ============================================================================

export interface Endpoint extends Resource {
  technology: string;
  resource: string;
  state?: string;
  channel_ids: string[];

  // Operations
  get(callback?: Callback<Endpoint>): Promise<Endpoint>;
  sendMessage(options: { from: string; body?: string; variables?: Record<string, string> }, callback?: Callback<void>): Promise<void>;
}

export interface EndpointsResource {
  list(callback?: Callback<Endpoint[]>): Promise<Endpoint[]>;
  sendMessage(options: { to: string; from: string; body?: string; variables?: Record<string, string> }, callback?: Callback<void>): Promise<void>;
  listByTech(options: { tech: string }, callback?: Callback<Endpoint[]>): Promise<Endpoint[]>;
  get(options: { tech: string; resource: string }, callback?: Callback<Endpoint>): Promise<Endpoint>;
  sendMessageToEndpoint(options: { tech: string; resource: string; from: string; body?: string; variables?: Record<string, string> }, callback?: Callback<void>): Promise<void>;
}

// ============================================================================
// Events
// ============================================================================

export interface EventsResource {
  eventWebsocket(options: { app: string | string[]; subscribeAll?: boolean }, callback?: Callback<Message>): Promise<Message>;
  userEvent(options: { eventName: string; application: string; source?: string | string[]; variables?: Record<string, string> }, callback?: Callback<void>): Promise<void>;
}

// ============================================================================
// Mailbox
// ============================================================================

export interface Mailbox extends Resource {
  name: string;
  old_messages: number;
  new_messages: number;

  // Operations
  get(callback?: Callback<Mailbox>): Promise<Mailbox>;
  update(options: { oldMessages: number; newMessages: number }, callback?: Callback<void>): Promise<void>;
  delete(callback?: Callback<void>): Promise<void>;
}

export interface MailboxesResource {
  list(callback?: Callback<Mailbox[]>): Promise<Mailbox[]>;
  get(options: { mailboxName: string }, callback?: Callback<Mailbox>): Promise<Mailbox>;
  update(options: { mailboxName: string; oldMessages: number; newMessages: number }, callback?: Callback<void>): Promise<void>;
  delete(options: { mailboxName: string }, callback?: Callback<void>): Promise<void>;
}

// ============================================================================
// Playback
// ============================================================================

export interface Playback extends Resource {
  id: string;
  media_uri: string;
  next_media_uri?: string;
  target_uri: string;
  language?: string;
  state: string;

  // Operations
  get(callback?: Callback<Playback>): Promise<Playback>;
  stop(callback?: Callback<void>): Promise<void>;
  control(options: { operation: 'restart' | 'pause' | 'unpause' | 'reverse' | 'forward' }, callback?: Callback<void>): Promise<void>;
}

export interface PlaybacksResource {
  get(options: { playbackId: string }, callback?: Callback<Playback>): Promise<Playback>;
  stop(options: { playbackId: string }, callback?: Callback<void>): Promise<void>;
  control(options: { playbackId: string; operation: 'restart' | 'pause' | 'unpause' | 'reverse' | 'forward' }, callback?: Callback<void>): Promise<void>;
}

// ============================================================================
// Recording
// ============================================================================

export interface LiveRecording extends Resource {
  name: string;
  format: string;
  state: string;
  target_uri: string;
  duration?: number;
  talking_duration?: number;
  silence_duration?: number;
  cause?: string;

  // Operations
  get(callback?: Callback<LiveRecording>): Promise<LiveRecording>;
  cancel(callback?: Callback<void>): Promise<void>;
  stop(callback?: Callback<void>): Promise<void>;
  pause(callback?: Callback<void>): Promise<void>;
  unpause(callback?: Callback<void>): Promise<void>;
  mute(callback?: Callback<void>): Promise<void>;
  unmute(callback?: Callback<void>): Promise<void>;
}

export interface StoredRecording extends Resource {
  name: string;
  format: string;

  // Operations
  get(callback?: Callback<StoredRecording>): Promise<StoredRecording>;
  delete(callback?: Callback<void>): Promise<void>;
  getFile(callback?: Callback<Buffer>): Promise<Buffer>;
  copy(options: { destinationRecordingName: string }, callback?: Callback<StoredRecording>): Promise<StoredRecording>;
}

export interface RecordingsResource {
  listStored(callback?: Callback<StoredRecording[]>): Promise<StoredRecording[]>;
  getStored(options: { recordingName: string }, callback?: Callback<StoredRecording>): Promise<StoredRecording>;
  deleteStored(options: { recordingName: string }, callback?: Callback<void>): Promise<void>;
  getStoredFile(options: { recordingName: string }, callback?: Callback<Buffer>): Promise<Buffer>;
  copyStored(options: { recordingName: string; destinationRecordingName: string }, callback?: Callback<StoredRecording>): Promise<StoredRecording>;
  getLive(options: { recordingName: string }, callback?: Callback<LiveRecording>): Promise<LiveRecording>;
  cancel(options: { recordingName: string }, callback?: Callback<void>): Promise<void>;
  stop(options: { recordingName: string }, callback?: Callback<void>): Promise<void>;
  pause(options: { recordingName: string }, callback?: Callback<void>): Promise<void>;
  unpause(options: { recordingName: string }, callback?: Callback<void>): Promise<void>;
  mute(options: { recordingName: string }, callback?: Callback<void>): Promise<void>;
  unmute(options: { recordingName: string }, callback?: Callback<void>): Promise<void>;
}

// ============================================================================
// Sound
// ============================================================================

export interface Sound extends Resource {
  id: string;
  text?: string;
  formats: FormatLangPair[];

  // Operations
  get(callback?: Callback<Sound>): Promise<Sound>;
}

export interface FormatLangPair {
  language: string;
  format: string;
}

export interface SoundsResource {
  list(options?: { lang?: string; format?: string }, callback?: Callback<Sound[]>): Promise<Sound[]>;
  get(options: { soundId: string }, callback?: Callback<Sound>): Promise<Sound>;
}

// ============================================================================
// Events
// ============================================================================

export interface Message {
  type: string;
  asterisk_id?: string;
}

export interface Event extends Message {
  application: string;
  timestamp?: string;
}

export interface DeviceStateChanged extends Event {
  type: 'DeviceStateChanged';
  device_state: DeviceState;
}

export interface PlaybackStarted extends Event {
  type: 'PlaybackStarted';
  playback: Playback;
}

export interface PlaybackContinuing extends Event {
  type: 'PlaybackContinuing';
  playback: Playback;
}

export interface PlaybackFinished extends Event {
  type: 'PlaybackFinished';
  playback: Playback;
}

export interface RecordingStarted extends Event {
  type: 'RecordingStarted';
  recording: LiveRecording;
}

export interface RecordingFinished extends Event {
  type: 'RecordingFinished';
  recording: LiveRecording;
}

export interface RecordingFailed extends Event {
  type: 'RecordingFailed';
  recording: LiveRecording;
}

export interface ApplicationReplaced extends Event {
  type: 'ApplicationReplaced';
}

export interface BridgeCreated extends Event {
  type: 'BridgeCreated';
  bridge: Bridge;
}

export interface BridgeDestroyed extends Event {
  type: 'BridgeDestroyed';
  bridge: Bridge;
}

export interface BridgeMerged extends Event {
  type: 'BridgeMerged';
  bridge: Bridge;
  bridge_from: Bridge;
}

export interface BridgeVideoSourceChanged extends Event {
  type: 'BridgeVideoSourceChanged';
  bridge: Bridge;
  old_video_source_id?: string;
}

export interface BridgeBlindTransfer extends Event {
  type: 'BridgeBlindTransfer';
  channel: Channel;
  replace_channel?: Channel;
  transferee?: Channel;
  exten: string;
  context: string;
  result: string;
  is_external: boolean;
  bridge?: Bridge;
}

export interface BridgeAttendedTransfer extends Event {
  type: 'BridgeAttendedTransfer';
  transferer_first_leg: Channel;
  transferer_second_leg: Channel;
  replace_channel?: Channel;
  transferee?: Channel;
  transfer_target?: Channel;
  result: string;
  is_external: boolean;
  transferer_first_leg_bridge?: Bridge;
  transferer_second_leg_bridge?: Bridge;
  destination_type: string;
  destination_bridge?: string;
  destination_application?: string;
  destination_link_first_leg?: Channel;
  destination_link_second_leg?: Channel;
  destination_threeway_channel?: Channel;
  destination_threeway_bridge?: Bridge;
}

export interface ChannelCreated extends Event {
  type: 'ChannelCreated';
  channel: Channel;
}

export interface ChannelDestroyed extends Event {
  type: 'ChannelDestroyed';
  cause: number;
  cause_txt: string;
  channel: Channel;
}

export interface ChannelEnteredBridge extends Event {
  type: 'ChannelEnteredBridge';
  bridge: Bridge;
  channel?: Channel;
}

export interface ChannelLeftBridge extends Event {
  type: 'ChannelLeftBridge';
  bridge: Bridge;
  channel: Channel;
}

export interface ChannelStateChange extends Event {
  type: 'ChannelStateChange';
  channel: Channel;
}

export interface ChannelDtmfReceived extends Event {
  type: 'ChannelDtmfReceived';
  digit: string;
  duration_ms: number;
  channel: Channel;
}

export interface ChannelDialplan extends Event {
  type: 'ChannelDialplan';
  channel: Channel;
  dialplan_app: string;
  dialplan_app_data: string;
}

export interface ChannelCallerId extends Event {
  type: 'ChannelCallerId';
  caller_presentation: number;
  caller_presentation_txt: string;
  channel: Channel;
}

export interface ChannelUserevent extends Event {
  type: 'ChannelUserevent';
  eventname: string;
  channel?: Channel;
  bridge?: Bridge;
  endpoint?: Endpoint;
  userevent: Record<string, any>;
}

export interface ChannelHangupRequest extends Event {
  type: 'ChannelHangupRequest';
  cause?: number;
  soft?: boolean;
  channel: Channel;
}

export interface ChannelVarset extends Event {
  type: 'ChannelVarset';
  variable: string;
  value: string;
  channel?: Channel;
}

export interface ChannelHold extends Event {
  type: 'ChannelHold';
  channel: Channel;
  musicclass?: string;
}

export interface ChannelUnhold extends Event {
  type: 'ChannelUnhold';
  channel: Channel;
}

export interface ChannelTalkingStarted extends Event {
  type: 'ChannelTalkingStarted';
  channel: Channel;
}

export interface ChannelTalkingFinished extends Event {
  type: 'ChannelTalkingFinished';
  channel: Channel;
  duration: number;
}

export interface ChannelConnectedLine extends Event {
  type: 'ChannelConnectedLine';
  channel: Channel;
}

export interface ContactStatusChange extends Event {
  type: 'ContactStatusChange';
  endpoint: Endpoint;
  contact_info: ContactInfo;
}

export interface ContactInfo {
  uri: string;
  contact_status: string;
  aor: string;
  roundtrip_usec?: string;
}

export interface PeerStatusChange extends Event {
  type: 'PeerStatusChange';
  endpoint: Endpoint;
  peer: Peer;
}

export interface Peer {
  peer_status: string;
  cause?: string;
  address?: string;
  port?: string;
  time?: string;
}

export interface EndpointStateChange extends Event {
  type: 'EndpointStateChange';
  endpoint: Endpoint;
}

export interface Dial extends Event {
  type: 'Dial';
  caller?: Channel;
  peer: Channel;
  forward?: string;
  forwarded?: Channel;
  dialstring?: string;
  dialstatus: string;
}

export interface StasisEnd extends Event {
  type: 'StasisEnd';
  channel: Channel;
}

export interface StasisStart extends Event {
  type: 'StasisStart';
  args: string[];
  channel: Channel;
  replace_channel?: Channel;
}

export interface TextMessageReceived extends Event {
  type: 'TextMessageReceived';
  message: TextMessage;
  endpoint?: Endpoint;
}

export interface TextMessage {
  from: string;
  to: string;
  body: string;
  variables?: Record<string, string>;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Callback<T> = (err: Error | null, result?: T) => void;

export type AriEvent =
  | DeviceStateChanged
  | PlaybackStarted
  | PlaybackContinuing
  | PlaybackFinished
  | RecordingStarted
  | RecordingFinished
  | RecordingFailed
  | ApplicationReplaced
  | BridgeCreated
  | BridgeDestroyed
  | BridgeMerged
  | BridgeVideoSourceChanged
  | BridgeBlindTransfer
  | BridgeAttendedTransfer
  | ChannelCreated
  | ChannelDestroyed
  | ChannelEnteredBridge
  | ChannelLeftBridge
  | ChannelStateChange
  | ChannelDtmfReceived
  | ChannelDialplan
  | ChannelCallerId
  | ChannelUserevent
  | ChannelHangupRequest
  | ChannelVarset
  | ChannelHold
  | ChannelUnhold
  | ChannelTalkingStarted
  | ChannelTalkingFinished
  | ChannelConnectedLine
  | ContactStatusChange
  | PeerStatusChange
  | EndpointStateChange
  | Dial
  | StasisEnd
  | StasisStart
  | TextMessageReceived;

// Client event emitter overloads
declare module 'ari-client' {
  interface Client {
    on(event: 'DeviceStateChanged', listener: (event: DeviceStateChanged, deviceState: DeviceState) => void): this;
    on(event: 'PlaybackStarted', listener: (event: PlaybackStarted, playback: Playback) => void): this;
    on(event: 'PlaybackContinuing', listener: (event: PlaybackContinuing, playback: Playback) => void): this;
    on(event: 'PlaybackFinished', listener: (event: PlaybackFinished, playback: Playback) => void): this;
    on(event: 'RecordingStarted', listener: (event: RecordingStarted, recording: LiveRecording) => void): this;
    on(event: 'RecordingFinished', listener: (event: RecordingFinished, recording: LiveRecording) => void): this;
    on(event: 'RecordingFailed', listener: (event: RecordingFailed, recording: LiveRecording) => void): this;
    on(event: 'ApplicationReplaced', listener: (event: ApplicationReplaced) => void): this;
    on(event: 'BridgeCreated', listener: (event: BridgeCreated, bridge: Bridge) => void): this;
    on(event: 'BridgeDestroyed', listener: (event: BridgeDestroyed, bridge: Bridge) => void): this;
    on(event: 'BridgeMerged', listener: (event: BridgeMerged, resources: { bridge: Bridge; bridge_from: Bridge }) => void): this;
    on(event: 'BridgeVideoSourceChanged', listener: (event: BridgeVideoSourceChanged, bridge: Bridge) => void): this;
    on(event: 'BridgeBlindTransfer', listener: (event: BridgeBlindTransfer, resources: any) => void): this;
    on(event: 'BridgeAttendedTransfer', listener: (event: BridgeAttendedTransfer, resources: any) => void): this;
    on(event: 'ChannelCreated', listener: (event: ChannelCreated, channel: Channel) => void): this;
    on(event: 'ChannelDestroyed', listener: (event: ChannelDestroyed, channel: Channel) => void): this;
    on(event: 'ChannelEnteredBridge', listener: (event: ChannelEnteredBridge, resources: { bridge: Bridge; channel?: Channel }) => void): this;
    on(event: 'ChannelLeftBridge', listener: (event: ChannelLeftBridge, resources: { bridge: Bridge; channel: Channel }) => void): this;
    on(event: 'ChannelStateChange', listener: (event: ChannelStateChange, channel: Channel) => void): this;
    on(event: 'ChannelDtmfReceived', listener: (event: ChannelDtmfReceived, channel: Channel) => void): this;
    on(event: 'ChannelDialplan', listener: (event: ChannelDialplan, channel: Channel) => void): this;
    on(event: 'ChannelCallerId', listener: (event: ChannelCallerId, channel: Channel) => void): this;
    on(event: 'ChannelUserevent', listener: (event: ChannelUserevent, resources: any) => void): this;
    on(event: 'ChannelHangupRequest', listener: (event: ChannelHangupRequest, channel: Channel) => void): this;
    on(event: 'ChannelVarset', listener: (event: ChannelVarset, channel?: Channel) => void): this;
    on(event: 'ChannelHold', listener: (event: ChannelHold, channel: Channel) => void): this;
    on(event: 'ChannelUnhold', listener: (event: ChannelUnhold, channel: Channel) => void): this;
    on(event: 'ChannelTalkingStarted', listener: (event: ChannelTalkingStarted, channel: Channel) => void): this;
    on(event: 'ChannelTalkingFinished', listener: (event: ChannelTalkingFinished, channel: Channel) => void): this;
    on(event: 'ChannelConnectedLine', listener: (event: ChannelConnectedLine, channel: Channel) => void): this;
    on(event: 'ContactStatusChange', listener: (event: ContactStatusChange, endpoint: Endpoint) => void): this;
    on(event: 'PeerStatusChange', listener: (event: PeerStatusChange, endpoint: Endpoint) => void): this;
    on(event: 'EndpointStateChange', listener: (event: EndpointStateChange, endpoint: Endpoint) => void): this;
    on(event: 'Dial', listener: (event: Dial, resources: any) => void): this;
    on(event: 'StasisEnd', listener: (event: StasisEnd, channel: Channel) => void): this;
    on(event: 'StasisStart', listener: (event: StasisStart, channel: Channel) => void): this;
    on(event: 'TextMessageReceived', listener: (event: TextMessageReceived, resources: any) => void): this;
    on(event: '*', listener: (event: AriEvent, resources: any) => void): this;
    on(event: 'WebSocketConnected', listener: () => void): this;
    on(event: 'WebSocketReconnecting', listener: (err?: Error) => void): this;
    on(event: 'WebSocketMaxRetries', listener: (err?: Error) => void): this;
    on(event: 'APILoadError', listener: (err: Error) => void): this;
    on(event: 'pong', listener: () => void): this;
    on(event: string, listener: (...args: any[]) => void): this;

    once(event: 'DeviceStateChanged', listener: (event: DeviceStateChanged, deviceState: DeviceState) => void): this;
    once(event: 'StasisStart', listener: (event: StasisStart, channel: Channel) => void): this;
    once(event: 'StasisEnd', listener: (event: StasisEnd, channel: Channel) => void): this;
    once(event: string, listener: (...args: any[]) => void): this;

    emit(event: string, ...args: any[]): boolean;
    removeListener(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
  }
}
