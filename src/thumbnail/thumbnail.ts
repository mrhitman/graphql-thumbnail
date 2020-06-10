import { Field, ID, ObjectType, Int } from "type-graphql";
import { IsUrl } from "class-validator";
import { Urls } from "./urls";

@ObjectType()
export class Thumbnail {
    @Field(() => ID)
    id: string;

    @Field({ description: 'url' })
    @IsUrl()
    website: string;

    @Field()
    status: string;

    @Field(() => Int)
    created_at: number;

    @Field(() => Urls)
    urls: Urls;

    @Field({ nullable: true })
    error_message?: string;

    @Field(() => Int, { nullable: true })
    error_code?: number;
}