import { StudentPs } from "src/studentps/studentps.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToOne, Index } from "typeorm";

@Entity()
// @Index(['spsId', 'date'], { unique: true })
export class ProjectProgress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    achievements: string;

    @Column({ nullable: true })
    plans: string;

    @Column({ nullable: true })
    taskdate: Date;

    @Column({ default: false })
    endorsed: boolean

    @Column({ nullable: true })
    endorsedon: Date;

    @Column({ nullable: true })
    endorsedBy: string;

    @Column({ nullable: true })
    mentorcomments: string;

    @Column({ nullable: true })
    mentorcommentedon: Date;

    @Column({ nullable: true })
    reviewercomments: string;

    @Column({ nullable: true })
    reviewercommentedon: Date;

    @Column({ nullable: true })
    reviewedBy: string;

    @Column({ nullable: true })
    createdby: string;

    @Column({ nullable: true, type: "date" })
    date: Date;

    @Column({ nullable: true })
    updatedby: string;

    @CreateDateColumn() // Use @CreateDateColumn for createdon
    createdon: Date;

    @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
    updatedon: Date;

    @ManyToOne(() => StudentPs, (studentps) => studentps.pp)
    @JoinTable({ name: 'spsId' })
    sps: StudentPs;

    @Column({ nullable: false })
    spsId: number
}
