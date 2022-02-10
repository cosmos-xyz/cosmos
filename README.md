# cosmos
Feature-rich extendable revolt.js framework

### Examples
* Javascript / ES6

```js
import { CosmosClient } from "@cosmos-xyz/cosmos";

const client = new CosmosClient();

client.on("ready", () => {

    console.log(`Logged in as ${client.user.username}`);

});

client.on("message", (message) => {

    if(message.content === "?ping") message.reply({ content: "Pong!" });

})

client.login(LOGIN_DETAILS);
```

* Typescript

```ts
import { CosmosClient } from "@cosmos-xyz/cosmos";

const client = new CosmosClient();

client.on("ready", () => {

    console.log(`Logged in as ${client.user!.username}`);

});

client.on("message", (message) => {

    if(message.content === "?ping") message.reply({ content: "Pong!" });

})

client.login(LOGIN_DETAILS);
```

### Installation
* @cosmos-xyz/cosmos
```
npm i @cosmos-xyz/cosmos
```

* revolt.js
```
npm i revolt.js
```

### Links
* [Repository](https://github.com/cosmos-xyz/cosmos)

* [Changelogs](https://github.com/cosmos-xyz/cosmos/releases)

* [Documentation](https://cosmos-xyz.github.io/cosmos)