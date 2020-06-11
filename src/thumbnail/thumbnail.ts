import { IsUrl } from "class-validator";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { Status } from "./status";
import { Urls } from "./urls";

@ObjectType()
export class Thumbnail {
    @Field(type => ID)
    id: string;

    @Field({ description: 'url' })
    @IsUrl()
    website: string;

    @Field(type => Status)
    status: Status;

    @Field(type => Int)
    created_at: number;

    @Field(type => Urls)
    urls: Urls;

    @Field({ nullable: true })
    error_message?: string;

    @Field(type => Int, { nullable: true })
    error_code?: number;
}