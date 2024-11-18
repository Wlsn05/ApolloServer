import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
    });
    console.log('Conectado a MongoDB...');
  } catch (err) {
    console.error('No se pudo conectar a MongoDB:', err);
    process.exit(1); // Termina el proceso si no se puede conectar
  }
};

export default connectDB;