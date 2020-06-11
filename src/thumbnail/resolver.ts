import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { ThumbnailInput } from "./input";
import { ThumbnailService } from "./service";
import { Thumbnail } from "./thumbnail";


@Resolver(of => Thumbnail)
export class ThumbnailResolver {
    protected service: ThumbnailService;

    constructor() {
        this.service = new ThumbnailService();
    }


    @Query(returns => Thumbnail, { nullable: true })
    async thumbnail(@Arg('id') id: string) {
        return this.service.get(id);
    }

    @Query(returns => [Thumbnail])
    async thumbnails() {
        return this.service.getAll();
    }

    @Mutation(returns => Thumbnail, { name: 'insert_thumbnail' })
    async insertThumbnail(@Arg("objects") input: ThumbnailInput) {
        return this.service.add(input);
    }
}
