import type { BaseServer } from '@logux/server'

import { users } from '@picker/protocol'

export default (server: BaseServer) => {
  server.type(users.rename, {
    access (ctx, action) {
      return action.payload.id === ctx.userId
    },
  })
}
