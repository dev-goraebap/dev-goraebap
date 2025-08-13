import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { NestMvcReq } from 'nestjs-mvc-tools';

@Controller()
export class AppController {

  @Get()
  async index(@Req() req: NestMvcReq, @Res() res: Response) {
    // 쿠키의 visited 값이 true일 경우 (이전에 방문한 적이 있는경우)
    // 게시물 조회 페이지로 이동 시키기
    const visited = false;
    if (visited) {
      return res.redirect('/posts');
    }

    // 목 데이터
    const series = [
      {
        id: 1,
        title: '앵귤러 입문하기',
        description: '앵귤러를 입문해보자',
        image: '/public/images/bg04.jpg'
      },
      {
        id: 2,
        title: 'Hotwired와 함께하는 백엔드 기반 프론트엔드',
        description: '백엔드 개발자도 프론트엔드를 할 수 있다',
        image: '/public/images/bg03.jpg'
      },
      {
        id: 3,
        title: 'NestJS 마스터하기',
        description: 'Node.js 백엔드 프레임워크 완전정복',
        image: '/public/images/bg02.jpg'
      }
    ];

    const posts = [
      {
        id: 1,
        title: 'CSS가 우릴 괴롭히는 것들',
        description: 'CSS의 예상치 못한 동작들과 해결 방법들을 알아보자',
        image: '/public/images/bg01.jpg'
      },
      {
        id: 2,
        title: '자바스크립트 비동기 완전정복',
        description: 'Promise, async/await부터 최신 패턴까지 한번에',
        image: '/public/images/bg02.jpg'
      },
      {
        id: 3,
        title: '웹 성능 최적화 실전 가이드',
        description: '실제 프로젝트에서 써먹을 수 있는 성능 최적화 팁들',
        image: '/public/images/bg03.jpg'
      },
      {
        id: 4,
        title: 'React Hooks 깊이 파보기',
        description: 'useEffect부터 커스텀 훅 만들기까지 완벽 가이드',
        image: '/public/images/bg04.jpg'
      },
      {
        id: 5,
        title: 'Docker로 개발환경 통일하기',
        description: '"내 컴퓨터에서는 잘 됐는데"를 없애보자',
        image: '/public/images/bg01.jpg'
      },
      {
        id: 6,
        title: 'Git 워크플로우 마스터하기',
        description: '협업할 때 꼭 알아야 할 Git 전략들',
        image: '/public/images/bg02.jpg'
      }
    ];

    const template = await req.view.render('pages/landing/index', {
      series,
      posts
    });
    return res.send(template);
  }

  @Get('about')
  async about() {}
}
