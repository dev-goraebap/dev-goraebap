import { application } from './application';
import { EditorController } from './editor.controller';
import { FileUploadController } from './file-upload.controller';
import { ImageLoaderController } from './image-loader.controller';
import { ModalController } from './modal.controller';
import { QueryController } from './query.controller';
import { TagInputController } from './tag-input.controller';
import { ThemeSwitcherController } from './theme-switcher.controller';

application.register('file-upload', FileUploadController);
application.register('editor', EditorController);
application.register('image-loader', ImageLoaderController);
application.register('query', QueryController);
application.register('theme-switcher', ThemeSwitcherController);
application.register('modal', ModalController);
application.register('tag-input', TagInputController);
