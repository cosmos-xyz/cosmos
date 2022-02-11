/* eslint-disable eqeqeq */
import { CosmosClient } from "../dist/index";

const client = new CosmosClient();

const areEqual = (first, second) => {
    if(first.length !== second.length) {
        return false;
    }
    for(let i = 0; i < first.length; i++) {
       if(!second.includes(first[i])) return false;
    }
    return true;
};

it("[permissions] Convert bitfield into array of permission strings", () => {
    // View, Send Message & Manage Channel
    const permStrings = client.perms.channelBitfieldToPermissionStrings(11);

    expect(areEqual(permStrings, ["View", "SendMessage", "ManageChannel"])).toBeTruthy();
});

it("[permissions] Convert bitfield into array of permission strings", () => {
    // View, Manage Roles & Kick Members
    const permStrings = client.perms.serverBitfieldToPermissionStrings(19);

    expect(areEqual(permStrings, ["View", "ManageRoles", "KickMembers"])).toBeTruthy();
});