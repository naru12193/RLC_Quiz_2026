
import ftp from 'basic-ftp'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const client = new ftp.Client()

client.ftp.verbose = true

async function deploy() {
  try {
    console.log('Connecting to FTP server...')

    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false,
    })

    console.log('Connected to FTP server.')

    const remoteDir = process.env.FTP_REMOTE_DIR

    console.log(`Navigating to ${remoteDir}...`)

    // Create remote directory if it does not exist
    await client.ensureDir(remoteDir)

    console.log('Clearing existing remote files...')

    // Remove existing files and folders
    await client.clearWorkingDir()

    console.log('Uploading new dist files...')

    // Upload contents of dist directory
    await client.uploadFromDir(
      path.join(__dirname, 'dist')
    )

    console.log('Deployment completed successfully!')
  } catch (error) {
    console.error('Deployment failed:', error)
    process.exitCode = 1
  } finally {
    client.close()
  }
}

deploy()
