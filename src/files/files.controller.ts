import {
  Controller,
  FileTypeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AccessTokenGuard } from '../auth/access-token.guard';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_SIZE, files: 1, fields: 0 },
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|gif|webp)$/,
            overrideMimeType: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const extension =
      file.mimetype === 'image/jpeg'
        ? 'jpg'
        : file.mimetype.slice('image/'.length);
    const filename = `${randomUUID()}.${extension}`;
    const uploadsDirectory = join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(join(uploadsDirectory, filename), file.buffer, {
      flag: 'wx',
    });

    return { url: `/uploads/${filename}` };
  }
}
