import {
  Arg,
  Mutation,
  Query,
  Resolver,
  Subscription,
  PubSub,
  Root,
  PubSubEngine,
} from "type-graphql";
import { ThumbnailInput } from "./inputs/input";
import { ThumbnailService } from "./service";
import { Thumbnail } from "./types/thumbnail";

@Resolver((of) => Thumbnail)
export class ThumbnailResolver {
  protected service: ThumbnailService;

  constructor() {
    this.service = new ThumbnailService();
  }

  @Query((returns) => Thumbnail, { nullable: true })
  public async thumbnail(@Arg("id") id: string) {
    return this.service.get(id);
  }

  @Query((returns) => [Thumbnail])
  public async thumbnails() {
    return this.service.getAll();
  }

  @Mutation((returns) => Thumbnail, { name: "insert_thumbnail" })
  public async insertThumbnail(
    @Arg("objects") input: ThumbnailInput,
    @PubSub() pubSub: PubSubEngine
  ) {
    const item = await this.service.add(input);
    await pubSub.publish("NewItem", item.id);
    return item;
  }

  @Subscription((returns) => Thumbnail, { topics: "NewItem" })
  public async normalSubscription(@Root() payload: string) {
    return this.service.get(payload);
  }
}
