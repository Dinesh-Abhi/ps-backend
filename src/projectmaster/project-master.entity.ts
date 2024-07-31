import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { SType } from 'src/enums';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { Milestone } from 'src/milestone/milestone.entity';

@Entity()
export class ProjectMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: null })
  category: string;

  @Column('text')
  problemstatement: string;

  @Column({ default: null })
  techstack: string;

  @Column({ default: null, nullable: true })
  reflink: string;

  @Column()
  maxgroups: number;

  @Column({ default: 0 })
  enrolledgroups: number;

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

  @ManyToMany(() => MentorMaster, (mentor) => mentor.projects)
  mentors: MentorMaster[];

  @ManyToOne(() => PsMaster, ps => ps.projects)
  @JoinColumn({ name: 'psId' })
  ps: PsMaster;

  @OneToMany(() => GroupMaster, groupmaster => groupmaster.project)
  groups: GroupMaster[];

  // @OneToMany(() => ProjectProgress, pps => pps.project)
  // pps: ProjectProgress[];

}