import { College } from 'src/college/college.entity';
import { SType } from 'src/enums';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';

@Entity()
export class AdminMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn() // Use @CreateDateColumn for createdon
  createdon: Date;

  @Column({ nullable: true })
  updatedBy:string;

  @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
  updatedon: Date;

  @Column({
    type: 'enum',
    enum: SType,
    default: SType.ACTIVE
  })
  status: SType;

  @OneToOne(() => UserMaster, (usermaster) => usermaster.admin)
  @JoinColumn()
  usermaster: UserMaster;

  @ManyToOne(() => College, (college) => college.studentmaster,{ nullable:false }) 
  @JoinColumn({ name: 'collegeId' })
  college: College;

}
