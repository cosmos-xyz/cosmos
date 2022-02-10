/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Client } from "revolt.js";
import TypedEmitter from "typed-emitter";
import EventEmitter from "node:events";
import { CosmosOptions, ConnectDetails } from "../typings/client";
import { CosmosUtils } from "./Utils";
import { Permissions } from "./Permissions";
import { CosmosEvents, MessageUpdatedDetails, ChannelUpdatedDetails, ServerUpdatedDetails, MemberUpdatedDetails, RoleUpdatedDetails, UserUpdatedDetails } from "../typings";
import { Role } from "revolt-api/types/Servers";

export class CosmosClient extends (EventEmitter as unknown as new () => TypedEmitter<CosmosEvents>) {
  readonly options: Partial<CosmosOptions>;
  readonly bot: Client;
  readonly utils: CosmosUtils;
  readonly perms: Permissions;

  connected: boolean;
  uptime: number;

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
