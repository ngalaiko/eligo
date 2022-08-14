# eligo

A small web app to try out [logux][] and [typescript][]

The app allows to create lists and randomly pick an item from those lists.
I use it on a daily basis to decide where I should have a lunch at.

## architecture

- [backend](./backend/) is a node app that runs [logux][]'s server node.
it's used to sync data between client nodes, persist data and create pick items from lists.
- [frontend](./frontend/) is a web app written in [sveltekit][].
it renders ui and runs [logux][] client nodes to interact with one another.

## development

```
$ pnpm dev
```

[logux]: https://logux.io/
[sveltekit]: https://sveltekit.io/
[typescript]: https://www.typescriptlang.org/
