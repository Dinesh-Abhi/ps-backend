import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn, } from 'typeorm';
import { StudentPs } from 'src/studentps/studentps.entity';
import { AttendanceEnum } from 'src/enums';

@Entity()
// @Index(['spsId', 'date'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AttendanceEnum
  })
  attendance: AttendanceEnum;

  @Column({ nullable: true })
  performance: string;

  @Column({ nullable: true, type: "date" })
  date: Date;

  @CreateDateColumn()
  createdon: Date;

  @UpdateDateColumn()
  updatedon: Date;

  @Column({ nullable: true })
  updatedby: string;

  @ManyToOne(() => StudentPs, (sps) => sps.attendance)
  @JoinColumn({ name: 'spsId' })
  sps: StudentPs;

  @Column({ nullable: false })
  spsId: number
}
