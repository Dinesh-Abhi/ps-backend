import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';

@Entity()
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  flag: number

  @Column({ nullable: true })
  updatedby: string;

  @CreateDateColumn() // Use @CreateDateColumn for createdon
  flaggedon: Date;

  @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
  flaggedoff: Date;

  // @ManyToOne(() => StudentMaster, (student) => student.watchlists)
  // @JoinColumn({name: 'studentId'})
  // students: StudentMaster;

  // @ManyToOne(() => PsMaster, (ps) => ps.watchlists)
  // @JoinColumn({name: 'psId'})
  // ps: PsMaster;
}
