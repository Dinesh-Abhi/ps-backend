import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    constructor() { }
    getHello(): string {
        const date = new Date()
        return (`API : Hello World !! ${date}. The Project-School aplication has been set up successfully`);
    }
}
