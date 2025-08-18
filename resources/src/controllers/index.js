import { application } from './application';
import { FileUploadController } from './file-upload.controller';
import { ImageLoaderController } from './image-loader.controller';
import { ModalController } from './modal.controller';
import { QueryController } from './query.controller';
import { SyntaxHighlighterController } from './syntax-highlighter.controller';
import { TagInputController } from './tag-input.controller';
import { ThemeSwitcherController } from './theme-switcher.controller';
import { ThumbnailUploaderToggle } from './thumbnail-uploader-toggle';

application.register('file-upload', FileUploadController);
application.register('image-loader', ImageLoaderController);
application.register('query', QueryController);
application.register('syntax-highlighter', SyntaxHighlighterController);
application.register('theme-switcher', ThemeSwitcherController);
application.register('modal', ModalController);
application.register('tag-input', TagInputController);
application.register('thumbnail-uploader-toggle', ThumbnailUploaderToggle);
