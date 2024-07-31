import { studentMilestoneDetails } from "src/common.interfaces ";
import { Milestone } from "src/milestone/milestone.entity";
import { StudentPs } from "src/studentps/studentps.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
// @Index(['spsId', 'msId'], { unique: true })
export class MilestoneStudentPs {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('simple-json', { nullable: true })
    milestonedetails: studentMilestoneDetails[];

    @Column({ type: 'longtext' })
    link: string;

    @Column('longtext', { nullable: true })
    comments: string;

    @Column({ default: false })
    notification: boolean

    @Column({ default: null })
    lastcommentedon: Date;

    @CreateDateColumn()
    createdon: Date;

    @UpdateDateColumn()
    updatedon: Date;

    @Column()
    createdby: string;

    @Column()
    updatedby: string;

    @Column({ nullable: true })
    marks: number;

    @Column({ nullable: true })
    markscomments: string

    @Column({ nullable: true })
    marksgivenby: string;

    @ManyToOne(() => Milestone, (ms) => ms.milestonestudentps)
    @JoinColumn({ name: 'msId' })
    milestone: Milestone;

    @Column({ nullable: false })
    msId: number;

    @ManyToOne(() => StudentPs, (sps) => sps.milestonestudentps)
    @JoinColumn({ name: 'spsId' })
    sps: StudentPs;

    @Column({ nullable: false })
    spsId: number;
}