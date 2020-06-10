import { Arg, Query, Resolver, Mutation } from "type-graphql";
import { Thumbnail } from "./thumbnail";
import { ThumbnailInput } from "./input";


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
    async get(@Arg('id') id: number): Promise<Thumbnail | undefined> {
        return this.items.find(item => item.id === id);
    }

    @Query(returns => [Thumbnail])
    async getAll(): Promise<Thumbnail[]> {
        return this.items;
    }

    @Mutation(returns => Thumbnail)
    async add(@Arg("objects") input: ThumbnailInput) {
        // console.log(input)
        return this.items[0]
    }
}
