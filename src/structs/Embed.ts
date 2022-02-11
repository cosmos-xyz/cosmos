import { SendableEmbed } from "revolt-api/types/Channels";

/**
 * Creates a sendable embed
 *
 * ```typescript
 * import { Embed } from "@cosmos-xyz/cosmos";
 *
 * client.on("message", (message) => {
 *   if(message.content === "/test") {
 *     // Create the embed object
 *     const embed = new Embed({ title: "This is a test embed" })
 *     .setDescription("- This also supports Markdown!")
 *     .setColour("RANDOM")
 *     // Send the embed
 *     message.channel!.sendMessage({ content: " ", embeds: [embed] });
 *   }
 * })
 * ```
 */
export class Embed {
  readonly type: "Text";
  icon_url?: string;
  url?: string;
  title?: string;
  description?: string;
  media?: string;
  colour?: string;

  constructor(value: Partial<SendableEmbed> = {}) {
    /**
     * The type of the embed.
     */
    this.type = value.type ?? "Text";

    /**
     * The embed icon URL
     */
    this.icon_url = value.icon_url ?? undefined;

    /**
     * The embed URL
     */
    this.url = value.url ?? undefined;

    /**
     * The embed title
     */
    this.title = value.title ?? undefined;
    if (this.title && this.title.length > 100) this.title = this.title.slice(0, 100);

    /**
     * The embed description
     */
    this.description = value.description ?? undefined;
    if (this.description && this.description.length > 2000) this.description = this.description.slice(0, 2000);

    /**
     * The embed media
     */
    this.media = value.media ?? undefined;

    /**
     * The embed colour
     */
    this.colour = (value.colour?.toLowerCase() === "random" ? this.getRandomColour() : value.colour) ?? undefined;
  }

  /**
   * Set the embed's title
   * @param title the title of the embed
   */
  setTitle(title: string) {
    this.title = title;
    if (this.title && this.title.length > 100) this.title = this.title.slice(0, 100);
    return this;
  }

  /**
   * Set the embed URL
   * @param url the URL of the embed
   */
  setURL(url: string) {
    this.url = url;
    return this;
  }

  /**
   * Set the embed's icon URL
   * @param icon the icon URL of the embed
   */
  setIconURL(icon: string) {
    this.icon_url = icon;
    return this;
  }

  /**
   * Set the embed's description
   * @param desc the description of the embed
   */
  setDescription(desc: string) {
    this.description = desc;
    if (this.description && this.description.length > 2000) this.description = this.description.slice(0, 2000);
    return this;
  }

  /**
   * Set the embed media
   * @param media the Autumn attachment ID
   */
  setMedia(media: string) {
    this.media = media;
    return this;
  }

  /**
   * Set the embed color
   * @param color The color of the embed.
   * Use "RANDOM" or "random" to get random colors
   */
  setColor(color: string) {
    this.colour = color.toLowerCase() === "random" ? this.getRandomColour() : color;
    return this;
  }

  /**
   * Set the embed colour
   * @param colour The colour of the embed.
   * Use "RANDOM" or "random" to get random colours
   */
  setColour(colour: string) {
    this.colour = colour.toLowerCase() === "random" ? this.getRandomColour() : colour;
    return this;
  }

  /**
   * Get a random hex code
   * @returns a random hex code
   */
  private getRandomColour() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
