import { plainToClass } from "class-transformer";
import nanoid from "nanoid";
import { ThumbnailInput } from "./input";
import { Status } from "./status";
import { Thumbnail } from "./thumbnail";
import puppeteer from 'puppeteer';
import { resolve } from 'path';
import sharp from 'sharp';

export class ThumbnailService {
    private readonly items: Thumbnail[] = [];

    public getAll() {
        return this.items;
    }

    public async get(id: string) {
        const item = await this.items.find(item => item.id === id);
        return item;
    }

    public async add(input: ThumbnailInput) {
        const newItem = plainToClass(Thumbnail, {
            ...input,
            id: nanoid.nanoid(),
            status: Status.processing,
            created_at: Math.floor((+new Date()) / 1000)
        });
        const hostname = await this.getSiteScreen(input.website);
        newItem.urls = {
            _256: 'http://localhost:3000/' + hostname + '_256.png',
            _512: 'http://localhost:3000/' + hostname + '_512.png',
        };
        newItem.status = Status.completed;
        this.items.push(newItem);
        return newItem;
    }

    protected async getSiteScreen(url: string) {
        const hostname = new URL(url).hostname.split('.').join('_');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const buffer = await page.screenshot({ fullPage: true });
        await Promise.all([
            sharp(buffer).resize(512).png().toFile(resolve('storage', hostname + '_512.png')),
            sharp(buffer).resize(256).png().toFile(resolve('storage', hostname + '_256.png'))
        ]);
        await browser.close();
        return hostname;
    }
}