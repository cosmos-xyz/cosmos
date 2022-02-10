import { CosmosClient } from "../dist/index";
import fetch from "node-fetch";
import { jest } from "@jest/globals";

// This might take a long time
jest.setTimeout(20000);

const client = new CosmosClient();

// Does not require the Revolt API
it("[autumn] Uploads file to Autumn", async () => {
    const img = await (await fetch("https://cdn.shibe.online/shibes/d68ef1780c4b195f775b8b8208db405480d164db.jpg")).arrayBuffer();
    const id = await client.utils.uploadFile({ name: "shiba.png", file: Buffer.from(img) }, "attachments");

    process.stdout.write(`Received ${id}`);
    expect(typeof id).toEqual("string");
}); 