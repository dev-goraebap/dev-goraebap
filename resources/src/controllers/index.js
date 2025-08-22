import { application } from './application';

import { FeedQueryController } from './feed/feed-query.controller';
import { FileUploadController } from './file-upload.controller';
import { ImageLoaderController } from './image-loader.controller';
import { ModalController } from './modal.controller';
import { PatchNotesQueryController } from './patch-notes/patch-notes-query.controller';
import { TagInputController } from './posts/tag-input.controller';
import { UpdatePublishController } from './posts/update-publish.controller';
import { QueryController } from './query.controller';
import { SeriesSelectPostController } from './series/select-post.controller';
import { SortableController } from './sortable_controller';
import { SyntaxHighlighterController } from './syntax-highlighter.controller';
import { ThemeSwitcherController } from './theme-switcher.controller';
import { ThumbnailUploaderToggle } from './thumbnail-uploader-toggle';

// 재사용성 컨트롤러
application.register('file-upload', FileUploadController);
application.register('image-loader', ImageLoaderController);
application.register('query', QueryController);
application.register('syntax-highlighter', SyntaxHighlighterController);
application.register('theme-switcher', ThemeSwitcherController);
application.register('modal', ModalController);
application.register('thumbnail-uploader-toggle', ThumbnailUploaderToggle);
application.register('sortable', SortableController);

// 특정 도메인에 종속적인 컨트롤러
application.register('tag-input', TagInputController);
application.register('series-select-post', SeriesSelectPostController);
application.register('update-publish', UpdatePublishController);
application.register('feed-query', FeedQueryController);
application.register('patch-notes-query', PatchNotesQueryController);
