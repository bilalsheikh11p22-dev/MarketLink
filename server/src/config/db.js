  import mongoose from 'mongoose'

  export async function connectDB(uri) {
    if (!uri) throw new Error('MONGO_URI is not defined')
    mongoose.set('strictQuery', true)
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
    console.log(`MongoDB connected: ${mongoose.connection.name}`) // host omitted from logs on purpose
  }
  export default connectDB
