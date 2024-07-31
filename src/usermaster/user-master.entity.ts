import { Column, Entity, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RType } from 'src/enums';
import { AuditLog } from 'src/auditlog/auditlog.entity';
import { AdminMaster } from 'src/adminmaster/admin-master.entity';
import { StudentMaster } from 'src/studentmaster/student-master.entity';
import { SuperAdminMaster } from 'src/superadminmaster/super-admin-master.entity';
import { EvaluatorMaster } from 'src/evaluatormaster/evaluator-master.entity';
import { CoordinatorMaster } from 'src/coordinatormaster/coordinator-master.entity';
import { MentorMaster } from 'src/mentormaster/mentor-master.entity';


@Entity()
export class UserMaster {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({
        type: 'enum',
        enum: RType
    })
    role: RType;

    @Column({ select: false })
    password: string;

    @Column({ default: null })
    refreshToken: string;

    // @Column({ default: null })
    // sessiontoken: string;

    // @Column({
    //     type: 'enum',
    //     enum: SType,
    //     default:SType.ACTIVE
    // })
    // status: SType;

    @CreateDateColumn() // Use @CreateDateColumn for createdon
    createdon: Date;

    @Column({ nullable: true })
    updatedBy: string;

    @UpdateDateColumn() // Use @UpdateDateColumn for updatedon
    updatedon: Date;

    @OneToOne(() => AdminMaster, (admin) => admin.usermaster)
    admin: AdminMaster;

    @OneToOne(() => StudentMaster, (student) => student.usermaster)
    student: StudentMaster;

    @OneToOne(() => SuperAdminMaster, (superadmin) => superadmin.usermaster)
    superadmin: SuperAdminMaster;

    @OneToMany(() => AuditLog, (auditLog) => auditLog.usermaster)
    auditlogs: AuditLog[];

    @OneToOne(() => EvaluatorMaster, (evaluator) => evaluator.usermaster)
    evaluator: EvaluatorMaster;

    @OneToOne(() => CoordinatorMaster, (coordinator) => coordinator.usermaster)
    coordinator: CoordinatorMaster;

    @OneToOne(() => MentorMaster, (mentor) => mentor.usermaster)
    mentor: MentorMaster;
}