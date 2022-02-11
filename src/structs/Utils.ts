/* eslint-disable @typescript-eslint/no-explicit-any */

import fetch from "node-fetch";
import { AttachmentTag as FileType } from "revolt-api/types/Autumn";
import { CosmosClient } from "./Client";
import { LIBRARY_VERSION } from "revolt.js";
import { Channel } from "revolt.js/dist/maps/Channels";
import { BadgeString, Badges } from "../typings/utils";
import { User } from "revolt.js/dist/maps/Users";

/**
 * Client utils
 */
export class CosmosUtils {
  client: CosmosClient;

  constructor(client: CosmosClient) {
    this.client = client;
  }

  /**
   * Get the versions for cosmos, revolt API and revolt.js
   */
  get versions() {
    return {
      cosmos: "0.2.0",
      revolt: this.client.bot.configuration?.revolt,
      "revolt.js": LIBRARY_VERSION
    };
  }

  private get boundary() {
    return "------COSMOS";
  }

  /**
   * Upload a file to Autumn
   * @param file the file name and buffer
   * @param type the file type, either "attachhments", "avatars", "backgrounds", "icons" or "banners"
   * @returns the attachment ID
   */
  async uploadFile(file: { name: string; file: Buffer }, type: FileType = "attachments") {
    const response = (await (
      await fetch(`https://autumn.revolt.chat/${type}`, {
        method: "POST",
        headers: { "Content-Type": `multipart/form-data; boundary=${this.boundary}` },
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        body: Buffer.concat(this.appendFormData("file", file.file, file.name)!)
      })
    ).json()) as unknown as { id: string };

    return response.id;
  }

  /**
   * Get the Autumn URL of a file
   * @param id the attachment ID
   * @param type the file type, either "attachhments", "avatars", "backgrounds", "icons" or "banners"
   * @param size The file size, max 20000000 for attachments
   * @returns the Autumn URL
   */
  imgToURL(id: string, type: FileType = "attachments", size: number) {
    return `https://autumn.revolt.chat/${type}/${id}${size ? `?max_side=${size}` : ""}`;
  }

  /**
   * For the multipart/form-data purposes
   */
  private appendFormData(name: string, data: any, fileName: string) {
    const fileBuffer: Buffer[] = [];

    if (!data) return;
    let str = `\r\n--${this.boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${fileName}"`;
    if (data instanceof Buffer) {
      str += "\r\nContent-Type: application/octet-stream";
    } else if (data instanceof Object) {
      str += "\r\nContent-Type: application/json";
      data = Buffer.from(JSON.stringify(data));
    } else {
      data = Buffer.from(`${data}`);
    }

    fileBuffer.push(Buffer.from(`${str}\r\n\r\n`));
    fileBuffer.push(data);

    fileBuffer.push(Buffer.from(`\r\n--${this.boundary}--`));
    return fileBuffer;
  }

  /**
   * Purge messages in a channel
   * @param channel the channel object
   * @param amount amount of messages to delete, max 100
   * @returns an array of results when all the provided Promises resolve or reject
   */
  async purgeMessages(channel: Channel, amount: number) {
    if (isNaN(amount)) throw new Error(`Amount should be a number, received ${typeof amount}`);
    if (amount < 1) throw new Error("Minimum amount to purge is 1");
    if (amount > 100) throw new Error("Purge amount exceeded limit (100)");

    const messages = await channel.fetchMessages({
      limit: amount
    });

    return await Promise.allSettled(messages.map((m) => m.delete()));
  }

  /**
   * Get the badges of a user
   * @param user the user object
   * @returns an array of badges
   */
  getUserBadge(user: User) {
    const bitfield = user.badges;
    if(!bitfield) return [];

    return Object.keys(Badges).filter((badge) => {
      if(Number(badge)) return false;
      // eslint-disable-next-line no-bitwise
      return bitfield & Number(Badges[badge as BadgeString]);
    }) as BadgeString[];
  }

  /**
   * Remove the spoiler tags from a string
   * @param message the string
   * @returns an object where
   * `count` represents total spoiler tags ("!!" is counted as 1) removed &
   * `message` represents original string without spoiler tags
   */
  escapeSpoilers(message: string) {
    const regex = new RegExp(/!!/gm).exec(message);
    // Spoiler tags require >1 "!!"
    if(regex && regex.length < 1) return message;

    const occurrences = message.match(/!!/gm)?.length ?? 0;
    if(!occurrences) return { count: 0, message: message };

    // A workaround to prevent normal exclamation mark being treated as a spoiler tag
    if(occurrences % 2 !== 0) {
      for(let i = 0; i < occurrences - 1; i++) {
        message = message.replace(/!!/, "");
      }
    } else {
      for(let i = 0; i < occurrences; i++) {
        message = message.replace(/!!/, "");
      }
    }

    return { count: (occurrences % 2 !== 0 ? occurrences - 1 : occurrences), message: message };
  }

  /**
   * Get the link embedded inside a message
   * @param message the string
   * @returns array of embedded links
   */
  getEmbeddedLink(message: string) {
    let strings = message.split(" ");
    strings = strings.filter((s) => (new RegExp(/\[.+\]\(.+\)/)).test(s));

    const res: string[] = [];

    for(let word of strings) {
      // Remove hypertext and brackets [] and ()
      word = word.replace(/\[.+\]\(/, "").replace(/\)/, "");
      // Remove angle brackets (used to hide link embed)
      word = word.replace(/</, "").replace(/>/, "");

      res.push(word);
    }

    return res;
  }

  /**
   * Remove block quotes from a message
   * @param message the string
   * @returns an object where
   * `count` represents total block quotes removed &
   * `message` represents original string without block quotes
   */
  escapeBlockQuotes(message: string) {
    const messages = message.split("\n");

    let res = 0;

    for(let edits of messages) {
      res++;
      if(!edits.startsWith(">")) continue;
      edits = edits.replace(/^>/, "");
      messages[res] = edits;
    }

    return { count: res, message: messages.join("\n") };
  }
}
