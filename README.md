# eligo

The app allows to collaborate on arbitrary lists and randomly pick items from those lists.
We use it on a daily basis to decide where to get lunch at.

## architecture

- [protocol](./protocol/) contains definitions of types and functions shared between frontedn and backend.
- [state](./state/) contains definitions of all possible events and a reducer to reduce event log into state.
- [backend](./backend/) holds a global app state and synronizes clients' states via websockets.
- [frontend](./frontend/) renders ui, holds a local state and creates events via websockets.

## deployment

- backend can be deployed on [fly.io][] by:

  ```sh
  flyctl deploy
  ```

  from the root directory. It's is also automatically deployed for every new commit in master.

- frontend is automatically deployed to [vercel][] using their GitHub integration on every new commit.

## development

```
$ pnpm dev
```

Local database will be created as [./backend/database.dev.json](./backend/database.dev.json).

[sveltekit]: https://sveltekit.io/
[typescript]: https://www.typescriptlang.org/
[fly.io]: https://fly.io/
[vercel]: https://vercel.com/
