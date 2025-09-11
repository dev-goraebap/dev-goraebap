import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

import { AdminAuthGuard, ZodValidationPipe } from 'src/common';
import { BlockedIpsService } from './blocked-ips.service';
import { CreateBlockedIpDto, CreateBlockedIpSchema } from './dto/create-blocked-ip.dto';
import { GetBlockedIpsDto, GetBlockedIpsSchema } from './dto/get-blocked-ips.dto';

@Controller({ path: 'admin/blocked-ips' })
@UseGuards(AdminAuthGuard)
export class BlockedIpsController {
  constructor(private readonly blockedIpsService: BlockedIpsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(GetBlockedIpsSchema))
  async index(@Req() req: NestMvcReq, @Query() dto: GetBlockedIpsDto) {
    const ipBlockedData = await this.blockedIpsService.getBlockedIpList(dto);
    return req.view.render('pages/admin/blocked-ips/index', { ...ipBlockedData });
  }

  @Get('new')
  async new(@Req() req: NestMvcReq) {
    return req.view.render('pages/admin/blocked-ips/new');
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateBlockedIpSchema))
  async create(@Req() req: NestMvcReq, @Body('blockedIp') dto: CreateBlockedIpDto) {
    await this.blockedIpsService.create(dto);
    return req.view.render('pages/admin/blocked-ips/_success');
  }

  // 차단 해제
  @Patch(':id/unblock')
  async unblock(@Req() req: NestMvcReq, @Param('id') id: number, @Res() res: Response) {
    await this.blockedIpsService.unblockIp(id);
    req.flash.success('IP 차단을 해제하였습니다.');
    return res.redirect(303, '/admin/blocked-ips');
  }

  // 영구 차단 설정
  @Patch(':id/permanent')
  async makePermanent(@Req() req: NestMvcReq, @Param('id') id: number, @Res() res: Response) {
    await this.blockedIpsService.makePermanentBlock(id);
    req.flash.success('영구 차단으로 설정하였습니다.');
    return res.redirect(303, '/admin/blocked-ips');
  }

  // 레코드 완전 제거
  @Delete(':id')
  async remove(@Req() req: NestMvcReq, @Param('id') id: number, @Res() res: Response) {
    await this.blockedIpsService.removeBlockedIp(id);
    req.flash.success('차단 IP 레코드를 삭제하였습니다.');
    return res.redirect(303, '/admin/blocked-ips');
  }
}
