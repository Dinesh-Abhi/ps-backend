import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { PsMaster } from 'src/psmaster/ps-master.entity';
import { SType } from 'src/enums';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';
import { CoordinatorMaster } from 'src/coordinatormaster/coordinator-master.entity';

@Entity()
export class College {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

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

  @OneToMany(() => PsMaster, (ps) => ps.college)
  psm: PsMaster[]

  @OneToMany(() => AdminMaster, (adminmaster) => adminmaster.college)
  adminmaster: AdminMaster[]

  @OneToMany(() => StudentMaster, (studentmaster) => studentmaster.college)
  studentmaster: StudentMaster[]

  @OneToMany(() => MentorMaster, (mentormaster) => mentormaster.college)
  mentormaster: MentorMaster[]

  @OneToMany(() => CoordinatorMaster, (coordinator) => coordinator.college)
  coordinator: CoordinatorMaster[];
}
