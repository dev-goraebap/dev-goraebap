import { application } from './application';
import { EditorController } from './editor.controller';
import { FileUploadController } from './file-upload.controller';

application.register('file-upload', FileUploadController);
application.register('editor', EditorController);
