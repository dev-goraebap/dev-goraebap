import { application } from './application';
import { FileUploadController } from './file-upload.controller';
import { HelloWorldController } from './hello_world_controller';

application.register('hello', HelloWorldController);
application.register('file-upload', FileUploadController);
