import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
@Entity()
export class EvaluationSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  start: Date;

  @Column({ nullable: true })
  end: Date;

  // @Column({ nullable: true })
  // enable: boolean;

  // @Column({ nullable: true })
  // enableon: Date;

  @Column({ nullable: true })
  enabledby: string;

  @CreateDateColumn()
  createdon: Date;

  @UpdateDateColumn()
  updatedon: Date;

  @Column()
  updatedby: string;

  @ManyToOne(() => PsMaster, ps => ps.evaluationschedule, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "psId" })
  ps: PsMaster;

  @OneToMany(() => EvaluatorStudent, evaluatorstudent => evaluatorstudent.evaluationschedule)
  evaluatorstudent: EvaluatorStudent[];
}
