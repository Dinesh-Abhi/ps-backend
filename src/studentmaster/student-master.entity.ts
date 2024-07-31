import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { College } from 'src/college/college.entity';
import { SType } from 'src/enums';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { StudentPs } from 'src/studentps/studentps.entity';

@Entity()
export class StudentMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  email: string;

  @Column()
  section: string;

  @CreateDateColumn() // Use @CreateDateColumn for createdon
  createdon: Date;

  @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
  updatedon: Date;

  @Column({ nullable: true })
  updatedby: string;

  @Column({
    type: 'enum',
    enum: SType,
    default: SType.ACTIVE
  })
  status: SType;

  @ManyToOne(() => College, (college) => college.studentmaster)
  @JoinColumn({ name: 'collegeId' })
  college: College;

  @OneToOne(() => UserMaster, (usermaster) => usermaster.student)
  @JoinColumn({ name: 'usermasterId' })
  usermaster: UserMaster;

  // @ManyToMany(() => GroupMaster, (groupmaster) => groupmaster.students)
  // @JoinTable({name:'student_group_mapping'})
  // groups: GroupMaster[];

  // @ManyToMany(() => PsMaster, (ps) => ps.students)
  // @JoinTable({ name: 'student_ps_mapping' })
  // psm: PsMaster[];

  @OneToMany(() => StudentPs, (ps) => ps.student)
  studentps: StudentPs[];

  // @OneToMany(() => Attendance, (attendance) => attendance.student)
  // attendances: Attendance[];

  // @OneToMany(() => Watchlist, watchlist => watchlist.students)
  // watchlists: Watchlist[];

  // @OneToMany(() => ProjectProgress, (pp) => pp.student)
  // pps: ProjectProgress[];

  // @OneToMany(() => EvaluatorStudent, (evaluatorstudent) => evaluatorstudent.students)
  // evaluatorstudent:EvaluatorStudent[]
}
