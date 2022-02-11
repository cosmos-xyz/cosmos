/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Client } from "revolt.js";
import EventEmitter from "eventemitter3";
import { CosmosOptions, ConnectDetails } from "../typings/client";
import { CosmosUtils } from "./Utils";
import { Permissions } from "./Permissions";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Member } from "revolt.js/dist/maps/Members";
import { Message } from "revolt.js/dist/maps/Messages";
import { Server } from "revolt.js/dist/maps/Servers";
import { User } from "revolt.js/dist/maps/Users";
import { ClientboundNotification } from "revolt.js/dist/websocket/notifications";
import { RelationshipStatus, User as RawUser } from "revolt-api/types/Users";
import type { Member as RawMember, MemberCompositeKey, Server as RawServer } from "revolt-api/types/Servers";
import type { Channel as RawChannel } from "revolt-api/types/Channels";
import { Role } from "revolt-api/types/Servers";
import { MessageUpdatedDetails, ChannelUpdatedDetails, ServerUpdatedDetails, MemberUpdatedDetails, RoleUpdatedDetails, UserUpdatedDetails } from "../typings";

export declare interface CosmosClient {
  /** Emitted when the server authenticated the connection */
  on(event: "connected", listener: () => void): this;
  /** Emitted when the client is connecting to the server */
  on(event: "connecting", listener: () => void): this;
  /** Emitted when the connection dropped */
  on(event: "disconnected", listener: () => void): this;

  /**
   * Emitted when the client is ready
   * @param users Total users object received from the websocket
   * @param servers Total servers object received from the websocket
   * @param channels Total channels object received from the websocket
   * @param members Total members object received from the websocket
   */
  on(event: "ready", listener: (users: RawUser[], servers: RawServer[], channels: RawChannel[], members: RawMember[]) => void): this;

  /** Emitted when the client logged out */
  on(event: "logout", listener: () => void): this;

  /**
   * Emitted when the websocket receives any data
   * @param payload The raw payload received from the websocket
   */
  on(event: "raw", listener: (payload: ClientboundNotification) => void): this;

  /**
   * Emitted when a message is sent
   * @param message The message object
   */
  on(event: "message", listener: (message: Message) => void): this;
  /**
   * Emitted when a message is edited
   * @param message The old message object (before edited)
   */
  on(event: "messageUpdate", listener: (message: Message, details: MessageUpdatedDetails) => void): this;
  /**
   * Emitted when a message is deleted 
   * @param _id The message ID
   */
  on(event: "messageDelete", listener: (_id: string) => void): this;

  /**
   * Emitted when a new channel is created 
   * @param channel The channel object
   */
  on(event: "channelCreate", listener: (channel: Channel) => void): this;
  /**
   * Emitted when a channel is editedhas updated changes
   * @param message The old channel object (before updated)
   */
  on(event: "channelUpdate", listener: (channel: Channel, details: ChannelUpdatedDetails) => void): this;
  /**
   * Emitted when a channel is deleted 
   * @param _id The channel ID
   */
  on(event: "channelDelete", listener: (_id: string) => void): this;

  /**
   * Emitted when a user joined a group 
   * @param _id The group channel ID
   * @param user The new group member object
   */
  on(event: "groupJoin", listener: (_id: string, user: string) => void): this;
  /**
   * Emitted when a group member left a group 
   * @param _id The group channel ID
   * @param user The group member ID
   */
  on(event: "groupLeave", listener: (_id: string, user: string) => void): this;

  /**
   * Emitted when a user started typing in a channel
   * @param _id The channel ID
   * @param user The user ID
   */
  on(event: "typingStart", listener: (_id: string, user: string) => void): this;
    /**
   * Emitted when a user stopped typing in a channel
   * @param _id The channel ID
   * @param user The user ID
   */
  on(event: "typingStop", listener: (_id: string, user: string) => void): this;
  /**
   * Emitted when the client acknowledged new messages in a channel up to @param message message ID
   * @param _id The channel ID
   * @param user The user ID
   * @param message The message ID
   */
  on(event: "channelAck", listener: (_id: string, user: string, message: string) => void): this;

  /**
   * Emitted when a server has updated details
   * @param server The old server object (before updated)
   */
  on(event: "serverUpdate", listener: (server: Server, details: ServerUpdatedDetails) => void): this;
  /**
   * Emitted when a server has been deleted 
   * @param _id The server ID
   */
  on(event: "serverDelete", listener: (_id: string) => void): this;

  /**
   * Emitted when a member joined a server
   * @param member The new member object
   */
  on(event: "memberJoin", listener: (member: Member) => void): this;
  /**
   * Emitted when a member has updated changes 
   * @param member The old member object (before updated)
   */
  on(event: "memberUpdate", listener: (member: Member, details: MemberUpdatedDetails) => void): this;
  /**
   * Emitted when a member left a server
   * @param _id An object containing the member ID and server ID
   */
  on(event: "memberLeave", listener: (_id: MemberCompositeKey) => void): this;

  /**
   * Emitted when a role is created or updated
   * @param role The role object 
   */
  on(event: "roleUpdate", listener: (role: Role, details: RoleUpdatedDetails) => void): this;
  /**
   * Emitted when a role is deleted
   * @param _id The role ID
   * @param server The server ID
   */
  on(event: "roleDelete", listener: (_id: string, server: string) => void): this;

  /**
   * Emitted when a user has updated changes
   * @param user The user object
   */
  on(event: "userUpdate", listener: (user: User, details: UserUpdatedDetails) => void): this;
  /**
   * Emitted when the client updated their relationship with a user
   * @param _id The client's user ID
   * @param user The user's ID
   * @param relationship The new relationship status*/
  on(event: "relationshipUpdate", listener: (_id: string, user: string, relationship: RelationshipStatus) => void): this;

  /**
   * Custom events (if you want to add some)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this;
}
export class CosmosClient extends EventEmitter {
  /** The client options given when initiating the client */
  readonly options: Partial<CosmosOptions>;
  /** The revolt.js `Client` object */
  readonly bot: Client;
  /** Utility functions */
  readonly utils: CosmosUtils;
  /** Permission checking */
  readonly perms: Permissions;

  /** If the bot is connected to the websocket */
  connected: boolean;
  /** Number (in milliseconds) since the bot is ready */
  uptime: number;

  /** Details for logging in */
  loginDetail?: ConnectDetails;

  constructor(options: Partial<CosmosOptions> = {}) {
    super();

    this.options = options;
    this.bot = new Client(this.options.revoltOpt);
    this.utils = new CosmosUtils(this);
    this.perms = new Permissions(this);

    this.connected = false;
    this.uptime = 0;

    this.bot.on("connected", () => (this.connected = true));
    this.bot.on("ready", () => (this.uptime = Date.now()));

    if (this.options.loginDetail) {
      this.loginDetail = this.options.loginDetail;
    }

    this.bot.on("connected", () => this.emit("connected"));

    // Event handling part
    this.bot.on("connected", () => this.emit("connected"));
    this.bot.on("connecting", () => this.emit("conneting"));
    this.bot.on("dropped", () => this.emit("disconnected"));

    this.bot.on("logout", () => this.emit("logout"));

    this.bot.on("message", (message) => this.emit("message", message));
    this.bot.on("message/delete", (_id) => this.emit("messageDelete", _id));

    this.bot.on("channel/create", (channel) => this.emit("channelCreate", channel));
    this.bot.on("channel/delete", (_id) => this.emit("channelDelete", _id));

    this.bot.on("server/delete", (_id) => this.emit("serverDelete", _id));

    this.bot.on("member/join", (member) => this.emit("memberJoin", member));
    this.bot.on("member/leave", (_id) => this.emit("memberLeave", _id));

    this.bot.on("role/delete", (_id, server) => this.emit("roleDelete", _id, server));

    this.bot.on("packet", (payload) => {
      this.emit("raw", payload);

      switch (payload.type) {
        case "Ready": {
          return this.emit("ready", payload.users, payload.servers, payload.channels, payload.members);
        }

        case "MessageUpdate": {
          const message = this.bot.messages.get(payload.id);
          message?.update(payload.data);
          const details: MessageUpdatedDetails = { _id: payload.id, data: payload.data };
          return this.emit("messageUpdate", message!, details);
        }

        case "ChannelUpdate": {
          const channel = this.bot.channels.get(payload.id);
          channel?.update(payload.data);
          const details: ChannelUpdatedDetails = { _id: payload.id, data: payload.data };
          if (payload.clear) details.clear = payload.clear;
          return this.emit("channelUpdate", channel!, details);
        }

        case "ChannelGroupJoin": {
          return this.emit("groupJoin", payload.id, payload.user);
        }

        case "ChannelGroupLeave": {
          return this.emit("groupLeave", payload.id, payload.user);
        }

        case "ChannelStartTyping": {
          return this.emit("typingStart", payload.id, payload.user);
        }

        case "ChannelStopTyping": {
          return this.emit("typingStop", payload.id, payload.user);
        }

        case "ChannelAck": {
          return this.emit("channelAck", payload.id, payload.user, payload.message_id);
        }

        case "ServerUpdate": {
          const server = this.bot.servers.get(payload.id);
          server?.update(payload.data);
          const details: ServerUpdatedDetails = { _id: payload.id, data: payload.data };
          if (payload.clear) details.clear = payload.clear;
          return this.emit("serverUpdate", server!, details);
        }

        case "ServerMemberUpdate": {
          const member = this.bot.members.get(payload.id.user);
          member?.update(payload.data);
          const details: MemberUpdatedDetails = { _id: payload.id, data: payload.data };
          if (payload.clear) details.clear = payload.clear;
          return this.emit("memberUpdate", member!, details);
        }

        case "ServerRoleUpdate": {
          const server = this.bot.servers.get(payload.id)!;
          const newRole = { ...server.roles?.[payload.role_id], ...payload.data } as Role;
          server.roles = { ...server.roles, [payload.role_id]: newRole };
          const details: RoleUpdatedDetails = { _id: payload.role_id, server: payload.id, data: payload.data };
          return this.emit("roleUpdate", newRole!, details);
        }

        case "UserUpdate": {
          const user = this.bot.users.get(payload.id);
          user?.update(payload.data);
          const details: UserUpdatedDetails = { _id: payload.id, data: payload.data };
          if (payload.clear) details.clear = payload.clear;
          return this.emit("userUpdate", user!, details);
        }

        case "UserRelationship": {
          return this.emit("relationshipUpdate", this.bot.user!._id!, payload.user._id, payload.status);
        }
      }
    });
  }

  /**
   * Returns ID of the client owner, if any.
   */
  get ownerID() {
    return this.bot.user?.bot?.owner;
  }

  /**
   * Login to Revolt
   * @param detail Login details, can also be defined when initiating the client
   * @returns An onboarding function if required, else undefined or void
   */
  async login(detail?: ConnectDetails) {
    if (!this.loginDetail) this.loginDetail = detail;

    switch (this.loginDetail?.type) {
      case "BOT": {
        if (!this.loginDetail.token) throw new Error("Token is required to login to the client!");
        return await this.bot.loginBot(this.loginDetail.token);
      }
      case "USER": {
        if (!this.loginDetail.details || !Object.keys(this.loginDetail.details).length) throw new Error("Details for logging in is missing!");
        return await this.bot.login(this.loginDetail.details);
      }
      case "EXISTING_SESSION": {
        if (!this.loginDetail.session) throw new Error("Session token is required for logging in!");
        if (!this.loginDetail.id) throw new Error("User ID is required for logging in!");
        return await this.bot.useExistingSession({ name: this.loginDetail.name ?? "Cosmos", user_id: this.loginDetail.id, token: this.loginDetail.session });
      }
    }
  }

  /**
   * Logout from Revolt
   * @returns void
   */
  async logout() {
    if (!this.connected) throw new Error("The client is not connected yet");
    return this.ownerID ? this.bot.reset() : this.bot.logout();
  }
}
