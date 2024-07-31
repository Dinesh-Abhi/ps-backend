import { EvaluationGradeEnum } from 'src/enums';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class EvaluationResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  answer1: number;

  @Column()
  answer2: number;

  @Column()
  answer3: number;

  @Column()
  answer4: number;

  @Column()
  answer5: number;

  @Column()
  answer6: number;

  @Column()
  answer7: number;

  @Column()
  answer8: number;

  @Column()
  answer9: number;

  @Column()
  answer10: number;

  @Column({ nullable: true })
  comments: string;

  @Column({ default: null, nullable: true })
  eliteflag: boolean;

  // @Column({
  //   type: 'enum',
  //   enum: EvaluationGradeEnum
  // })
  // grade: EvaluationGradeEnum;

  @Column()
  grade: number;

  @CreateDateColumn()
  createdon: Date;

  @UpdateDateColumn()
  updatedon: Date;

  @Column({ nullable: true })
  updatedby: string;

  @OneToOne(() => EvaluatorStudent, evaluatorstudent => evaluatorstudent.evaluationresult, { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false })
  @JoinColumn({ name: "estudentId" })
  evaluatorstudent: EvaluatorStudent;
}
