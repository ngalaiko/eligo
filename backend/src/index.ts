import { SUBPROTOCOL } from "@picker/protocol";
import { Server } from "@logux/server";

import registerItems from "./modules/items.js";

const server = new Server(
  Server.loadOptions(process, {
    subprotocol: SUBPROTOCOL,
    supports: SUBPROTOCOL,
    fileUrl: import.meta.url,
  })
);

server.auth(() => true);
registerItems(server)
server.listen();
