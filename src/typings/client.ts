import { MemberCompositeKey, Role } from "revolt-api/types/Servers";
import { ClientOptions } from "revolt.js";
import { User as RawUser } from "revolt-api/types/Users";
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
