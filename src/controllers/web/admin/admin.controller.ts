import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AdminAuthGuard } from 'src/common';

@Controller({ path: 'admin' })
@UseGuards(AdminAuthGuard)
export class AdminController {
  @Get()
  index(@Res() res: Response) {
    return res.redirect('/admin/posts');
  }
}