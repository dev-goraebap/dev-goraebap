import { Controller, Get } from "@nestjs/common";

/**
 * @description 조회기반의 모듈 (게시물 도메인)
 */
@Controller({ path: 'patch-notes' })
export class PatchNoteController {
  @Get()
  async index() { }

  @Get(':slug')
  async show() { }
}