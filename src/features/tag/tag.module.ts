import { Module } from "@nestjs/common";
import { TagCreationService } from "./tag-creation.service";

@Module({
  providers: [TagCreationService],
  exports: [TagCreationService]
})
export class FeatureTagModule {}