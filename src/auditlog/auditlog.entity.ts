import { UserMaster } from 'src/usermaster/user-master.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ type: 'text' })
  info: string;

  @CreateDateColumn() // Use @CreateDateColumn for createdon
  createdon: Date;

  @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
  updatedon: Date;

  @ManyToOne(() => UserMaster, (usermaster) => usermaster.auditlogs)
  @JoinColumn({ name: 'usermasterId' })
  usermaster: UserMaster;
}
