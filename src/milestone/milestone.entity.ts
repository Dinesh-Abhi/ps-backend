import { MilestoneStudentPs } from "src/milestonestudentps/milestonestudentps.entity";
import { ProjectMaster } from "src/projectmaster/project-master.entity";
import { PsMaster } from "src/psmaster/ps-master.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MilestoneType } from "src/enums";

@Entity()
// @Index(['name', 'psId'], { unique: true })
export class Milestone {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true, type: "date" })
    lastdate: Date;

    @Column({ nullable: true, type: 'longtext' })
    description: string;

    @Column({ default: false })
    enable: boolean;

    @Column({ nullable: true, default: null })
    enabledate: Date;

    @Column({ nullable: true })
    weightage: number;

    @CreateDateColumn()
    createdon: Date;

    @UpdateDateColumn()
    updatedon: Date;

    @Column()
    createdby: string;

    @Column()
    updatedby: string;

    @ManyToOne(() => PsMaster, (ps) => ps.milestones, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'psId' })
    ps: PsMaster;

    @Column({ nullable:  true })
    psId: number;

    @OneToMany(() => MilestoneStudentPs, (msps) => msps.milestone)
    milestonestudentps: MilestoneStudentPs[];
}