import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn, } from 'typeorm';
import { SType } from 'src/enums';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';
import { StudentPs } from 'src/studentps/studentps.entity';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';

@Entity()
export class GroupMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  name: string;

  @Column({ nullable: true })
  nominee1: string

  @Column({ nullable: true })
  nominee2: string

  @CreateDateColumn()
  createdon: Date;

  @UpdateDateColumn()
  updatedon: Date;

  @Column({ nullable: true })
  createdby: string;

  @Column({ nullable: true })
  project_enrolled: Date;

  @Column({ nullable: true })
  project_enrolledby: string;

  @Column({ nullable: true })
  updatedby: string;

  @Column({
    type: 'enum',
    enum: SType,
    default: SType.ACTIVE
  })
  status: SType;

  @Column({ nullable: true })
  psId: number;

  @ManyToOne(() => ProjectMaster, project => project.groups)
  @JoinColumn({ name: 'projectId' })
  project: ProjectMaster;

  @OneToMany(() => StudentPs, (sps) => sps.group)
  sps: StudentPs[];

  @OneToMany(() => EvaluatorStudent, evaluatorstudent => evaluatorstudent.group)
  evaluatorstudent: EvaluatorStudent[];
}
