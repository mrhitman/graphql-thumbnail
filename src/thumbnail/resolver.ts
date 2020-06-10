import { Arg, Query, Resolver } from "type-graphql";
import { Thumbnail } from "./thumbnail";


@Resolver(of => Thumbnail)
export class ThumbnailResolver {
    private readonly items: Thumbnail[] = [{
        id: 1,
        website: 'sadasd',
        status: 'asda',
        urls: {
            _256: 'asdasd',
            _512: 'asdasd'
        },
        created_at: 1323
    }];

    @Query(returns => Thumbnail, { nullable: true })
    async getThumbnail(@Arg('id') id: number): Promise<Thumbnail | undefined> {
        return await this.items.find(item => item.id === id);
    }

    @Query(returns => [Thumbnail])
    async getThumbnails(): Promise<Thumbnail[]> {
        return await this.items;
    }
}
