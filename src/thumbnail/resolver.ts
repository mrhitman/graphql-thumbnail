import { plainToClass } from "class-transformer";
import nanoid from "nanoid";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { ThumbnailInput } from "./input";
import { Thumbnail } from "./thumbnail";
import { Status } from "./status";


@Resolver(of => Thumbnail)
export class ThumbnailResolver {
    private readonly items: Thumbnail[] = [{
        id: '1',
        website: 'sadasd',
        status: Status.completed,
        urls: {
            _256: 'asdasd',
            _512: 'asdasd'
        },
        created_at: 1323
    }];

    @Query(returns => Thumbnail, { nullable: true })
    async getThumbnail(@Arg('id') id: string) {
        return this.items.find(item => item.id === id);
    }

    @Query(returns => [Thumbnail])
    async getThumbnails() {
        return this.items;
    }

    @Mutation(returns => Thumbnail)
    async addThumbnail(@Arg("objects") input: ThumbnailInput) {
        const newItem = plainToClass(Thumbnail, {
            ...input,
            id: nanoid.nanoid(),
            status: Status.processing,
            created_at: Math.floor((+new Date()) / 1000)
        });

        this.items.push(newItem);
        return newItem;
    }
}
