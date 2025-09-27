import { Controller, Get } from "@nestjs/common";

@Controller({ path: 'posts' })
export class PostController {

  @Get(':slug')
  show() { }
}