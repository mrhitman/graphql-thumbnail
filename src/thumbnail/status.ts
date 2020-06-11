import { registerEnumType } from "type-graphql";

export enum Status {
    processing,
    completed,
    failed,
}

registerEnumType(Status, {
    name: "Status",
});