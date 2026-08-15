import { config } from './config/env.js'
import { connectDb, isConnected } from './config/db.js'
import { seedAdminUser } from './services/userService.js'
import app from './app.js'

async function start() {
  await connectDb()

  if (isConnected()) {
    await seedAdminUser().catch((err) => {
      console.error('[startup] Failed to seed admin:', err.message)
    })
  }

  app.listen(config.port, () => {
    console.log(`CodeScope homepage running at http://localhost:${config.port}`)
  })
}

start()
