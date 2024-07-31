import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { College } from "src/college/college.entity";
import { PSSType } from "src/enums";
import { ProjectMaster } from "src/projectmaster/project-master.entity";
import { EvaluatorStudent } from "src/evaluatorstudent/evaluator-student.entity";
import { StudentPs } from "src/studentps/studentps.entity";
import { Milestone } from "src/milestone/milestone.entity";
import { EvaluationSchedule } from "src/evaluationschedule/evaluationschedule.entity";

@Entity()
export class PsMaster {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column()
  // season: number;

  // @Column()
  // name: string;

  @Column({ nullable: true })
  academicyear: string;

  @Column()
  studentyear: number;

  @Column()
  semester: string;

  @Column()
  groupcount: number;

  @CreateDateColumn() // Use @CreateDateColumn for createdon
  createdon: Date;

  @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
  updatedon: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({
    type: 'enum',
    enum: PSSType,
    default: PSSType.IN_PROGRESS,
  })
  status: PSSType;

  @Column({ nullable: true })
  group_start: Date;

  @Column({ nullable: true })
  group_end: Date;

  @Column({ default: null })
  group_scheduled_by: string;

  @Column({ default: null })
  last_updatedon_gschedule: Date;

  @Column({ nullable: true })
  project_start: Date;

  @Column({ nullable: true })
  project_end: Date;

  @Column({ default: null })
  project_scheduled_by: string;

  @Column({ default: null })
  last_updatedon_pschedule: Date;

  @ManyToOne(() => College, (college) => college.psm)
  @JoinColumn({ name: 'collegeId' })
  college: College;

  @OneToMany(() => ProjectMaster, (project) => project.ps)
  projects: ProjectMaster[];

  // @OneToMany(() => GroupMaster, (group) => group.ps)
  // groups: GroupMaster[];

  // @ManyToMany(() => StudentMaster, (student) => student.psm)
  // @JoinTable({name:'student_ps_mapping'})
  // students: StudentMaster[];

  // @OneToMany(() => Attendance, (attendance) => attendance.ps)
  // attendances: Attendance[];

  // @OneToMany(() => Watchlist, (watchlist) => watchlist.ps)
  // watchlists: Watchlist[];

  @OneToMany(() => StudentPs, (studentps) => studentps.ps)
  studentps: StudentPs[];

  @OneToMany(() => Milestone, (milestones) => milestones.ps)
  milestones: Milestone[];

  @OneToMany(()=>EvaluationSchedule,(evaluationschedule)=>evaluationschedule.ps)
  evaluationschedule: EvaluationSchedule[];
}