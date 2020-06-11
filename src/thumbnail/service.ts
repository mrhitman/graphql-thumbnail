import { plainToClass } from 'class-transformer';
import nanoid from 'nanoid';
import { ThumbnailInput } from './inputs/input';
import { Status } from './types/status';
import { Thumbnail } from './types/thumbnail';
import puppeteer from 'puppeteer';
import { resolve } from 'path';
import sharp from 'sharp';
import minio from '../minio';

enum ErrorCode {
  INVALID_URL,
  UNKNOWN,
}

export class ThumbnailService {
  private readonly items: Thumbnail[] = [];

  public getAll() {
    return this.items;
  }

  public async get(id: string) {
    const item = await this.items.find((item) => item.id === id);
    return item;
  }

  public async add(input: ThumbnailInput) {
    const newItem = plainToClass(Thumbnail, {
      ...input,
      id: nanoid.nanoid(),
      status: Status.processing,
      created_at: Math.floor(+new Date() / 1000),
    });

    try {
      newItem.urls = await this.getSiteScreen(input.website);
      newItem.status = Status.completed;
    } catch (e) {
      newItem.status = Status.failed;
      switch (e.name) {
        case 'TypeError':
          newItem.error_code = ErrorCode.INVALID_URL;
          break;
        default:
          newItem.error_code = ErrorCode.UNKNOWN;
      }
      newItem.error_message = e.message;
    }

    this.items.push(newItem);
    return newItem;
  }

  protected async getSiteScreen(url: string) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--headless', '--disable-gpu'],
    });
    const page = await browser.newPage();
    await page.goto(url);
    const buffer = await page.screenshot({ fullPage: true });
    const _512name = Buffer.from(url + '_512').toString('base64') + '.png';
    const _256name = Buffer.from(url + '_256').toString('base64') + '.png';
    const [buff512, buff256] = await Promise.all([
      sharp(buffer)
        .resize({ width: 512, height: 512 })
        .png()
        .toBuffer(),
      sharp(buffer)
        .resize({ width: 256, height: 256 })
        .png()
        .toBuffer()
    ]);
    const [_512, _256] = await Promise.all([
      this.save(buff512, _512name),
      this.save(buff256, _256name)
    ]);
    await browser.close();
    return { _512, _256 }
  }

  protected async save(file: Buffer, name: string) {
    const bucket = process.env.MINIO_BUCKET!;
    const isExists = await minio.bucketExists(bucket);

    if (!isExists) {
      await minio.makeBucket(bucket, 'us-east-1');
    }

    const metaData = { 'Content-Type': 'image/png' };
    await minio.putObject(bucket, name, file, metaData);
    return minio.presignedUrl('GET', bucket, name);
  }
}
