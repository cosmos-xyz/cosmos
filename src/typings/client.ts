import { MemberCompositeKey, Role } from "revolt-api/types/Servers";
import { ClientOptions } from "revolt.js";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Member } from "revolt.js/dist/maps/Members";
import { Message } from "revolt.js/dist/maps/Messages";
import { Server } from "revolt.js/dist/maps/Servers";
import { User } from "revolt.js/dist/maps/Users";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";
import { RelationshipStatus, User as RawUser } from "revolt-api/types/Users";
import type { Member as RawMember, Server as RawServer } from "revolt-api/types/Servers";
import type { Channel as RawChannel, Message as RawMessage } from "revolt-api/types/Channels";

/**
 * Options when initiating the client
 */
export interface CosmosOptions {
  revoltOpt?: Partial<ClientOptions>;
  loginDetail?: ConnectDetails;
}

/**
 * Details for logging in
 */
export type ConnectDetails =
  | {
      type: "BOT";
      token?: string;
    }
  | {
      type: "USER";
      details?: {
        captcha?: string;
        challenge?: string;
        email: string;
        friendly_name?: string;
        password: string;
      };
    }
  | {
      type: "EXISTING_SESSION";
      name?: string;
      session?: string;
      id?: string;
    };

/**
 * Client events, added missing events from revolt.js
 */
export interface CosmosClientEvents {
  /** Emitted when the server authenticated the connection */
  connected: () => void;
  /** Emitted when the client is connecting to the server */
  connecting: () => void;
  /** Emitted when the connection dropped */
  disconnected: () => void;

  /**
   * Emitted when the client is ready
   * @param users Total users object received from the websocket
   * @param servers Total servers object received from the websocket
   * @param channels Total channels object received from the websocket
   * @param members Total members object received from the websocket
   */
  ready: (users: RawUser[], servers: RawServer[], channels: RawChannel[], members: RawMember[]) => void;

  /** Emitted when the client logged out */
  logout: () => void;

  /**
   * Emitted when the websocket receives any data
   * @param payload The raw payload received from the websocket
   */
  raw: (payload: ClientboundNotification) => void;

  /**
   * Emitted when a message is sent
   * @param message The message object
   */
  message: (message: Message) => void;
  /**
   * Emitted when a message is edited
   * @param message The old message object (before edited)
   */
  messageUpdate: (message: Message, details: MessageUpdatedDetails) => void;
  /**
   * Emitted when a message is deleted 
   * @param _id The message ID
   */
  messageDelete: (_id: string) => void;

  /**
   * Emitted when a new channel is created 
   * @param channel The channel object
   */
  channelCreate: (channel: Channel) => void;
  /**
   * Emitted when a channel is editedhas updated changes
   * @param message The old channel object (before updated)
   */
  channelUpdate: (channel: Channel, details: ChannelUpdatedDetails) => void;
  /**
   * Emitted when a channel is deleted 
   * @param _id The channel ID
   */
  channelDelete: (_id: string) => void;

  /**
   * Emitted when a user joined a group 
   * @param _id The group channel ID
   * @param user The new group member object
   */
  groupJoin: (_id: string, user: string) => void;
  /**
   * Emitted when a group member left a group 
   * @param _id The group channel ID
   * @param user The group member ID
   */
  groupLeave: (_id: string, user: string) => void;

  /**
   * Emitted when a user started typing in a channel
   * @param _id The channel ID
   * @param user The user ID
   */
  typingStart: (_id: string, user: string) => void;
    /**
   * Emitted when a user stopped typing in a channel
   * @param _id The channel ID
   * @param user The user ID
   */
  typingStop: (_id: string, user: string) => void;
  /**
   * Emitted when the client acknowledged new messages in a channel up to @param message message ID
   * @param _id The channel ID
   * @param user The user ID
   * @param message The message ID
   */
  channelAck: (_id: string, user: string, message: string) => void;

  /**
   * Emitted when a server has updated details
   * @param server The old server object (before updated)
   */
  serverUpdate: (server: Server, details: ServerUpdatedDetails) => void;
  /**
   * Emitted when a server has been deleted 
   * @param _id The server ID
   */
  serverDelete: (_id: string) => void;

  /**
   * Emitted when a member joined a server
   * @param member The new member object
   */
  memberJoin: (member: Member) => void;
  /**
   * Emitted when a member has updated changes 
   * @param member The old member object (before updated)
   */
  memberUpdate: (member: Member, details: MemberUpdatedDetails) => void;
  /**
   * Emitted when a member left a server
   * @param _id An object containing the member ID and server ID
   */
  memberLeave: (_id: MemberCompositeKey) => void;

  /**
   * Emitted when a role is created or updated
   * @param role The role object 
   */
  roleUpdate: (role: Role, details: RoleUpdatedDetails) => void;
  /**
   * Emitted when a role is deleted
   * @param _id The role ID
   * @param server The server ID
   */
  roleDelete: (_id: string, server: string) => void;

  /**
   * Emitted when a user has updated changes
   * @param user The user object
   */
  userUpdate: (user: User, details: UserUpdatedDetails) => void;
  /**
   * Emitted when the client updated their relationship with a user
   * @param _id The client's user ID
   * @param user The user's ID
   * @param relationship The new relationship status*/
  relationshipUpdate: (_id: string, user: string, relationship: RelationshipStatus) => void;
}

export type CosmosEvents = CosmosClientEvents & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [event: string]: (...args: any[]) => void;
};

export interface MessageUpdatedDetails {
  _id: string;
  data: Partial<RawMessage>;
}

export interface ChannelUpdatedDetails {
  _id: string;
  data: Partial<RawChannel>;
  clear?: "Icon" | "Description";
}

export interface ServerUpdatedDetails {
  _id: string;
  data: Partial<RawServer>;
  clear?: "Icon" | "Banner" | "Description";
}

export interface MemberUpdatedDetails {
  _id: MemberCompositeKey;
  data: Partial<RawMember>;
  clear?: "Nickname" | "Avatar";
}

export interface RoleUpdatedDetails {
  _id: string;
  server: string;
  data: Partial<Role>;
}

export interface UserUpdatedDetails {
  _id: string;
  data: Partial<RawUser>;
  clear?: "ProfileContent" | "ProfileBackground" | "StatusText" | "Avatar";
}
