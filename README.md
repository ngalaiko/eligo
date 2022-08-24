# eligo

A small web app to try out [logux][] and [typescript][].

The app allows to create lists and randomly pick an item from those lists.
I use it on a daily basis to decide where I should have a lunch at.

## architecture

- [backend](./backend/) is a node app that runs [logux][]'s server node.
  it's used to sync data between client nodes, persist data and pick items from lists.
- [frontend](./frontend/) is a web app written in [sveltekit][].
  it renders ui and runs [logux][] client nodes.

## deployment

- backend can be deployed on [fly.io][] by running:

  ```sh
  flyctl deploy
  ```

  from the root directory.

- frontend is automatically deployed to [vercel][] from their GitHub integration.

## development

```
$ pnpm dev
```

Local database will be created as [./backend/database.dev.json](./backend/database.dev.json).

[logux]: https://logux.io/
[sveltekit]: https://sveltekit.io/
[typescript]: https://www.typescriptlang.org/
[fly.io]: https://fly.io/
[vercel]: https://vercel.com/
