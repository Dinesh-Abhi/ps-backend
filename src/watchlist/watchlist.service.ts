import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Watchlist } from './watchlist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WatchlistService {
    private filepath: string;
    constructor(
        @InjectRepository(Watchlist)
        private readonly watchlistRepository: Repository<Watchlist>,
    ) {
        this.filepath = path.basename(__filename);
    }
}
