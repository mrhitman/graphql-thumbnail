import { IsUrl } from 'class-validator';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import { Status } from './status';
import { Urls } from './urls';

@ObjectType()
export class Thumbnail {
  @Field((type) => ID)
  id: string;

  @IsUrl()
  @Field({ description: 'url in format protocol://domain.tld' })
  website: string;

  @Field((type) => Status)
  status: Status;

  @Field((type) => Int, { description: 'unix timestamp' })
  created_at: number;

  @Field((type) => Urls, { nullable: true })
  urls: Urls;

  @Field({ nullable: true })
  error_message?: string;

  @Field((type) => Int, { nullable: true })
  error_code?: number;
}
