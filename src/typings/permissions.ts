/**
 * Enum of channel permission strings and bitfield
 */
export enum ChannelPermission {
  View = 1,
  SendMessage = 2,
  ManageMessages = 4,
  ManageChannel = 8,
  VoiceCall = 16,
  InviteOthers = 32,
  EmbedLinks = 64,
  UploadFiles = 128,
  Masquerade = 256
}

/**
 * Enum of server permission strings and bitfield
 */
export enum ServerPermission {
  View = 1,
  ManageRoles = 2,
  ManageChannels = 4,
  ManageServer = 8,
  KickMembers = 16,
  BanMembers = 32,
  ChangeNickname = 4096,
  ManageNicknames = 8192,
  ChangeAvatar = 16384,
  RemoveAvatars = 32768
}

export type ChannelPermissionString = keyof typeof ChannelPermission;
export type ServerPermissionString = keyof typeof ServerPermission;
