import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PostSharedService } from 'src/core/application/_concern';

@Controller()
export class SitemapController {
  constructor(private readonly postsSharedService: PostSharedService) {}

  @Get('sitemap.xml')
  async sitemap(@Res() res: Response) {
    const posts = await this.postsSharedService.getPublishedPosts();

    const baseUrl = 'https://dev.goraebap.xyz';
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/series</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${baseUrl}/patch-notes</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;

    for (const post of posts) {
      const lastmod = post.updatedAt
        ? post.updatedAt.split('T')[0]
        : post.publishedAt
          ? post.publishedAt.split('T')[0]
          : currentDate;

      sitemap += `
      <url>
        <loc>${baseUrl}/posts/${post.slug}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>`;
    }

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    return res.send(sitemap);
  }

  @Get('robots.txt')
  robots(@Res() res: Response) {
    try {
      const robotsPath = join(process.cwd(), 'resources', 'public', 'robots.txt');
      const robotsContent = readFileSync(robotsPath, 'utf8');

      res.setHeader('Content-Type', 'text/plain');
      return res.send(robotsContent);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      res.status(404).send('robots.txt not found');
    }
  }
}