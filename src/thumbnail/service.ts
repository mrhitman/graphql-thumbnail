import { plainToClass } from 'class-transformer';
import nanoid from 'nanoid';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import minio from '../minio';
import { ThumbnailInput } from './inputs/input';
import { Status } from './types/status';
import { Thumbnail } from './types/thumbnail';

enum ErrorCode {
  INVALID_URL,
  UNKNOWN,
}

export class ThumbnailService {
  private items: Thumbnail[] = [];

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

    this.items.push(newItem);
    return newItem;
  }

  public async processItem(id: string) {
    const item = await this.get(id);
    if (!item) return;

    try {
      item.urls = await this.getSiteScreen(item.website);
      item.status = Status.completed;
    } catch (e) {
      item.status = Status.failed;
      switch (e.name) {
        case 'TypeError':
          item.error_code = ErrorCode.INVALID_URL;
          break;
        default:
          item.error_code = ErrorCode.UNKNOWN;
      }
      item.error_message = e.message;
    }
  }

  protected async getSiteScreen(url: string) {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--headless', '--disable-gpu'],
    });
    const page = await browser.newPage();
    await page.goto(url);
    const buffer = await page.screenshot({ fullPage: true });
    const _512file = Buffer.from(url + '_512').toString('base64') + '.png';
    const _256file = Buffer.from(url + '_256').toString('base64') + '.png';
    const buff512 = await sharp(buffer)
      .resize({ width: 512, height: 512 })
      .png()
      .toBuffer();
    const buff256 = await sharp(buff512)
      .resize({ width: 256, height: 256 })
      .png()
      .toBuffer();
    const _512link = await this.save(buff512, _512file);
    const _256link = await this.save(buff256, _256file);
    await browser.close();
    return { _512: _512link, _256: _256link };
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
