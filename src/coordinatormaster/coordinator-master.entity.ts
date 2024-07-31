import { College } from "src/college/college.entity";
import { SType } from "src/enums";
import { UserMaster } from "src/usermaster/user-master.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class CoordinatorMaster{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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

  @OneToOne(() => UserMaster, (usermaster) => usermaster.coordinator)
  @JoinColumn()
  usermaster: UserMaster;
  
  @ManyToOne(()=>College,(college)=> college.coordinator)
  @JoinColumn({name:"collegeId"})
  college:College;
}