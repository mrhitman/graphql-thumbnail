import { Field, ID, ObjectType, Int } from 'type-graphql';
import { IsUrl } from 'class-validator';

@ObjectType()
export class Urls {
  @Field()
  @IsUrl()
  _256: string;

  @Field(() => ID)
  @IsUrl()
  _512: string;
}
