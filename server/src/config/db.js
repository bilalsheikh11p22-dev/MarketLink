import mongoose from 'mongoose'

const cache = globalThis.__mongoCache || (globalThis.__mongoCache = { promise: null })

export async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is not defined')
  if (mongoose.connection.readyState === 1) return
  if (!cache.promise) {
    mongoose.set('strictQuery', true)
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000, bufferCommands: false })
      .then(() => console.log(`MongoDB connected: ${mongoose.connection.name}`))
      .catch((err) => { cache.promise = null; throw err })
  }
  await cache.promise
}
export default connectDB