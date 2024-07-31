import { Module } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { WatchlistController } from './watchlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchlist } from './watchlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist]),
  ],
  providers: [WatchlistService],
  controllers: [WatchlistController]
})
export class WatchlistModule {}
