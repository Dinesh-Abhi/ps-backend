import { Attendance } from "src/attendance/attendance.entity";
import { ReviewComment } from "src/common.interfaces ";
import { GroupFormEnum, SType } from "src/enums";
import { EvaluatorStudent } from "src/evaluatorstudent/evaluator-student.entity";
import { GroupMaster } from "src/groupmaster/group-master.entity";
import { MilestoneStudentPs } from "src/milestonestudentps/milestonestudentps.entity";
import { ProjectProgress } from "src/projectprogress/project-progress.entity";
import { PsMaster } from "src/psmaster/ps-master.entity";
import { StudentMaster } from "src/studentmaster/student-master.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class StudentPs {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'enum',
        enum: SType,
        default: SType.ACTIVE
    })
    status: SType;

    @Column({
        type: 'enum',
        enum: GroupFormEnum,
        default: GroupFormEnum.NOTINGROUP
    })
    group_status: GroupFormEnum;

    @Column({ default: null })
    g_lock: number;

    @Column({ nullable: true })
    githublink: string;

    @Column({ nullable: true })
    gitupdatedon: Date;

    @Column({ nullable: true, default: false })
    reviewcommentnotification: boolean;

    @Column('simple-json', { nullable: true })
    reviewcomments: ReviewComment[];

    @Column('simple-json', { nullable: true })
    mentorreviewcomments: ReviewComment[];
    
    @CreateDateColumn() // Use @CreateDateColumn for createdon
    createdon: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
    updatedon: Date;

    @ManyToOne(() => StudentMaster, (student) => student.studentps)
    @JoinColumn({ name: 'studentId' })
    student: StudentMaster

    @ManyToOne(() => PsMaster, (ps) => ps.studentps)
    @JoinColumn({ name: 'psId' })
    ps: PsMaster

    @OneToMany(() => EvaluatorStudent, (es) => es.studentps)
    es: EvaluatorStudent[];

    @ManyToOne(() => GroupMaster, (group) => group.sps)
    @JoinColumn({ name: 'groupId' })
    group: GroupMaster;

    @Column({ nullable: true })
    groupId: number

    @OneToMany(() => ProjectProgress, (pp) => pp.sps)
    pp: ProjectProgress[];

    @OneToMany(() => Attendance, att => att.sps)
    attendance: Attendance[];

    @OneToMany(() => MilestoneStudentPs, msps => msps.sps)
    milestonestudentps: MilestoneStudentPs[];
}