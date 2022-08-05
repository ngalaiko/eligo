import { SUBPROTOCOL } from "@picker/protocol";
import { Server } from "@logux/server";

const server = new Server(
  Server.loadOptions(process, {
    subprotocol: SUBPROTOCOL,
    supports: SUBPROTOCOL,
    fileUrl: import.meta.url,
  })
);

server.auth(() => true);

server.listen();
