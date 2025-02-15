import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function start() {
  try {
    const PORT = process.env.PORT ?? 3003;
    const app = await NestFactory.create(AppModule);
    // app.useGlobalPipes(new ValidationPipe());
    // app.setGlobalPrefix('api');
    // app.enableCors({
    //   origin: (origin, callback) => {
    //     const allowedOrigins = [
    //       'http://localhost:8000',
    //       'http://localhost:3000',
    //       'http://skidkachi.uz',
    //       'http://api.skidkachi.uz',
    //       'http://skidkachi.vercel.app',
    //     ];
    //     if (!origin || allowedOrigins.includes(origin)) {
    //       callback(null, true);
    //     } else {
    //       callback(new BadRequestException('Not allowed by CORS'));
    //     }
    //   },
    //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //   credentials: true,
    // });
    await app.listen(PORT, () => {
      console.log(`Server started at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();
