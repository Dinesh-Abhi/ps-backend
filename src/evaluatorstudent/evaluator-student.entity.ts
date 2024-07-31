import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EvaluationSchedule } from 'src/evaluationschedule/evaluationschedule.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { EvaluationResult } from 'src/evaluationresults/evaluation-results.entity';
import { EvaluationType } from 'src/enums';

@Entity()
export class EvaluatorStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EvaluationType,
    default: EvaluationType.NOEVALUATION
  })
  type: EvaluationType;

  @CreateDateColumn()
  createdon: Date;

  @UpdateDateColumn()
  updatedon: Date;

  @Column({ nullable: true })
  updatedby: string;

  @ManyToOne(() => EvaluationSchedule, evaluationschedule => evaluationschedule.evaluatorstudent, { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false })
  @JoinColumn({ name: 'escheduleId' })
  evaluationschedule: EvaluationSchedule;

  @ManyToOne(() => StudentPs, (sps) => sps.es)
  @JoinColumn({ name: 'spsId' })
  studentps: StudentPs;

  @ManyToOne(() => EvaluatorMaster, evaluator => evaluator.evaluatorstudent, { onUpdate: "CASCADE" })
  @JoinColumn({ name: 'evaluatorId' })
  evaluator: EvaluatorMaster;

  @ManyToOne(() => GroupMaster, group => group.evaluatorstudent, { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: true })
  @JoinColumn({ name: 'groupId' })
  group: GroupMaster;

  @OneToOne(() => EvaluationResult, evaluationresult => evaluationresult.evaluatorstudent)
  evaluationresult: EvaluationResult;
}

