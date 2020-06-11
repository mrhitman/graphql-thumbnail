import { plainToClass } from 'class-transformer';
import nanoid from 'nanoid';
import { ThumbnailInput } from './inputs/input';
import { Status } from './types/status';
import { Thumbnail } from './types/thumbnail';
import puppeteer from 'puppeteer';
import { resolve } from 'path';
import sharp from 'sharp';

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
      const { _256, _512 } = await this.getSiteScreen(input.website);
      newItem.urls = {
        _256: `${process.env.HOST}:${process.env.PORT}/${_256}`,
        _512: `${process.env.HOST}:${process.env.PORT}/${_512}`,
      };
      newItem.status = Status.completed;
    } catch (e) {
      newItem.status = Status.failed;
      switch (e.name) {
        case 'TypeError':
          newItem.error_code = 400;
          break;
        case 'Error':
          newItem.error_code = 404;
          break;
        default:
          newItem.error_code = 500;
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
    const _512 = Buffer.from(url + '_512').toString('base64') + '.png';
    const _256 = Buffer.from(url + '_256').toString('base64') + '.png';
    await Promise.all([
      sharp(buffer)
        .resize({ width: 512, height: 512 })
        .png()
        .toFile(resolve('storage', _512)),
      sharp(buffer)
        .resize({ width: 256, height: 256 })
        .png()
        .toFile(resolve('storage', _256)),
    ]);
    await browser.close();
    return { _256, _512 };
  }
}
