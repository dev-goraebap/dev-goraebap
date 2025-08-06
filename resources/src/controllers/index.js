import { application } from './application';
import { EditorController } from './editor.controller';
import { FileUploadController } from './file-upload.controller';
import { ImageLoaderController } from './image-loader.controller';

application.register('file-upload', FileUploadController);
application.register('editor', EditorController);
application.register('image-loader', ImageLoaderController);
