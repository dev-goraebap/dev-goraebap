import { Global, Module } from "@nestjs/common";

import { PostRepository } from "./repositories/post.repository";
import { CloudflareR2Service, GoogleImageService } from "./services";

const services = [
  GoogleImageService,
  CloudflareR2Service
];

const repositories = [
  PostRepository
]

@Global()
@Module({
  providers: [...services, ...repositories],
  exports: [...services, ...repositories]
})
export class InfrastructureModule { }