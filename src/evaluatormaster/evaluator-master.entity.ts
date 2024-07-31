import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { SType } from 'src/enums';
import { UserMaster } from 'src/usermaster/user-master.entity';
import { GroupMaster } from 'src/groupmaster/group-master.entity';
import { EvaluatorStudent } from 'src/evaluatorstudent/evaluator-student.entity';

@Entity()
export class EvaluatorMaster {
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

  @OneToOne(() => UserMaster, (usermaster) => usermaster.evaluator)
  @JoinColumn({ name: 'usermasterId' })
  usermaster: UserMaster;

  @OneToMany(() => EvaluatorStudent, evaluatorstudent => evaluatorstudent.evaluator)
  evaluatorstudent: EvaluatorStudent[];
}
