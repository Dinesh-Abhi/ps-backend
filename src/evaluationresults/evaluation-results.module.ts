import { Module } from '@nestjs/common';
import { EvaluationResultsService } from './evaluation-results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { EvaluationStudentResults } from './evaluation-results.entity';
import { EvaluationResultsController } from './evaluation-results.controller';
import { EvaluationResult } from './evaluation-results.entity';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
// import { EvaluationGroupResults } from './evaluation-group-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationResult,EvaluatorStudent])],
  controllers: [EvaluationResultsController],
  providers: [EvaluationResultsService]
})
export class EvaluatorResultsModule {}
