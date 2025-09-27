import { Global, Module } from "@nestjs/common";

import { POST_REPO, POST_TABLE_GATEWAY } from "src/app/post";
import { PostRepository } from "src/shared/drizzle";
import { PostTableGateway } from "./table-gateways/post-table.gateway";

const repositories = [
  { provide: POST_REPO, useClass: PostRepository }
];

const tableGateway = [
  { provide: POST_TABLE_GATEWAY, useClass: PostTableGateway }
]

@Global()
@Module({
  providers: [
    ...repositories,
    ...tableGateway
  ],
  exports: [
    ...repositories,
    ...tableGateway
  ]
})
export class InfraModule { }