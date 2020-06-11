import { Field, InputType } from 'type-graphql';

@InputType()
export class ThumbnailInput {
  @Field()
  website: string;
}
