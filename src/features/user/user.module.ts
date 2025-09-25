import { Module } from "@nestjs/common";
import { AdminCreationService } from "./admin-creation.service";

@Module({
  providers: [AdminCreationService],
  exports: [AdminCreationService]
})
export class FeatureUserModule {}