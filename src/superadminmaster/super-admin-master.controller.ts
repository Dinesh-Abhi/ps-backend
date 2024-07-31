import { Controller } from '@nestjs/common';
import * as path from 'path';

@Controller('superusermaster')
export class SuperAdminMasterController {
    private filepath: string;
    constructor() {
        this.filepath = path.basename(__filename);
    }
}
