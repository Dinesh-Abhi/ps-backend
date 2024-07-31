import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { College } from 'src/college/college.entity';
import { SType } from 'src/enums';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { ProjectMaster } from 'src/projectmaster/project-master.entity';

@Entity()
export class MentorMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

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

  @ManyToOne(() => College, (college) => college.mentormaster)
  @JoinColumn({ name: 'collegeId' })
  college: College;

  @OneToOne(() => UserMaster, (usermaster) => usermaster.mentor)
  @JoinColumn({ name: 'usermasterId' })
  usermaster: UserMaster;

  @ManyToMany(() => ProjectMaster, (project) => project.mentors)
  @JoinTable({name:'mentor_project_mapping'})
  projects: ProjectMaster[];
}
