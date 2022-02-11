/* eslint-disable no-bitwise */

import { U32_MAX, DEFAULT_PERMISSION_DM } from "revolt.js/dist/api/permissions";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Server } from "revolt.js/dist/maps/Servers";
import { User } from "revolt.js/dist/maps/Users";
import { CosmosClient } from "./Client";
import { ChannelPermission, ServerPermission, ChannelPermissionString, ServerPermissionString } from "../typings/permissions";

/**
 * Permission handling
 */
export class Permissions {
  client: CosmosClient;

  constructor(client: CosmosClient) {
    this.client = client;
  }

  /**
   * Get the channel's permission bitfield
   * @param channel the channel object
   * @param user the user object
   * @returns the permission bitfield
   */
  getChannelBitfield(channel: Channel, user: User) {
    switch (channel.channel_type) {
      case "SavedMessages": {
        return U32_MAX;
      }
      case "DirectMessage":
      case "Group": {
        return DEFAULT_PERMISSION_DM;
      }
      case "TextChannel":
      case "VoiceChannel": {
        if (!channel.server) return 0;
        if (channel.server.owner === user._id) return U32_MAX;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const member = this.client.bot.members.getKey({ user: user._id, server: channel.server_id! });
        if (!member) return 0;

        let permission = (channel.default_permissions ?? channel.server.default_permissions[1]) >>> 0;

        if (member.roles) {
          for (const role of member.roles) {
            permission |= (channel.role_permissions?.[role] ?? 0) >>> 0;
            permission |= (channel.server.roles?.[role].permissions[1] ?? 0) >>> 0;
          }
        }

        return permission;
      }
    }
  }

  /**
   * Get the server's permission bitfield
   * @param server the server object
   * @param user the user object
   * @returns the permission bitfield
   */
  getServerBitfield(server: Server, user: User) {
    if(server.owner === user._id) return U32_MAX;

    const member = this.client.bot.members.getKey({ user: user._id, server: server._id });
    if(!member) return 0;

    let permission = server.default_permissions[0] >>> 0;
    if(member.roles) {
      for (const role of member.roles) {
        permission |= (server.roles?.[role].permissions[0] ?? 0) >>> 0;
      }
    }

    return permission;
  }

  /**
   * Convert the channel's permission bitfield into Permission strings
   * @see {@link ChannelPermission}
   * @param bitfield the permission bitfield
   * @returns array of permission strings
   */
  channelBitfieldToPermissionStrings(bitfield: number) {
    if(bitfield > 511) return [
      "View", 
      "SendMessage", 
      "ManageMessages", 
      "ManageChannel", 
      "VoiceCall",
      "Invite Others",
      "EmbedLinks",
      "UploadFiles",
      "Masquerade"
    ];

    return Object.keys(ChannelPermission).filter((perm) => {
      if(Number(perm)) return false;
      return bitfield & Number(ChannelPermission[perm as ChannelPermissionString]);
    }) as ChannelPermissionString[];
  }

  /**
   * Convert the server's permission bitfield into Permission strings
   * @see {@link ServerPermission}
   * @param bitfield the permission bitfield
   * @returns array of permission strings
   */
  serverBitfieldToPermissionStrings(bitfield: number) {
    if(bitfield > 61503) return [
      "View",
      "ManageRoles",
      "ManageChannels",
      "ManageServer",
      "KickMembers",
      "BanMembers",
      "ChangeNickname",
      "ManageNickname",
      "ChangeAvatar",
      "RemoveAvatars"
    ];

    return Object.keys(ServerPermission).filter((perm) => {
      if(Number(perm)) return false;
      return bitfield & Number(ServerPermission[perm as ServerPermissionString]);
    }) as ServerPermissionString[];
  }

  /**
   * Get the channel permissions in permission strings
   * @param channel the channel object
   * @param user the user object
   * @returns array of permission strings
   */
  getChannelPermissions(channel: Channel, user: User) {
    const bitfield = this.getChannelBitfield(channel, user);
    return this.channelBitfieldToPermissionStrings(bitfield);
  }

  /**
   * Get the server permissions in permission strings
   * @param server the server object
   * @param user the user object
   * @returns array of permission strings
   */
  getServerPermissions(server: Server, user: User) {
    const bitfield = this.getServerBitfield(server, user);
    return this.serverBitfieldToPermissionStrings(bitfield);
  }

  /**
   * Check if the user has the permissions provided
   * @param channel the channel object
   * @param user the user object
   * @param permissions array of permission strings, eg ["View", "SendMessage"]
   * @returns boolean
   */
  hasChannelPermissions(channel: Channel, user: User, permissions: ChannelPermissionString[]) {
    const bitfield = this.getChannelBitfield(channel, user);
    const perms = this.channelBitfieldToPermissionStrings(bitfield);
    return (perms === permissions);
  }

  /**
   * Check if the user has the permissions provided
   * @param server the server object
   * @param user the user object
   * @param permissions array of permission strings, eg ["View", "ChangeNickname"]
   * @returns boolean
   */
  hasServerPermissions(server: Server, user: User, permissions: ServerPermissionString[]) {
    const bitfield = this.getServerBitfield(server, user);
    const perms = this.serverBitfieldToPermissionStrings(bitfield);
    return (perms === permissions);
  }
}
