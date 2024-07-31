export enum RType {
    SUPERADMIN = "SUPERADMIN",
    ADMIN = "ADMIN",
    EVALUATOR = "EVALUATOR",
    MENTOR = "MENTOR",
    STUDENT = "STUDENT",
    COORDINATOR = "CORRDINATOR"
}

export enum EvaluationGradeEnum {
   NEEDIMPROVEMENTS = "Needs Improvement",
   ACCEPTABLE = "Acceptable",
   EXCEEDSEXPECTATIONS ="Exceeds Expectations",
}

export enum PSSType {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED"
}

export enum SType {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export enum AttendanceEnum {
    PRESENT = "PRESENT",
    ABSENT = "ABSENT"
}

export enum GroupFormEnum{
    TRYAGAIN = "TRYAGAIN",
    INGROUP = "INGROUP",
    NOTINGROUP = "NOTINGROUP",
    GROUPPROCESSING = "GROUPPROCESSING"
}

export enum EvaluationType{
    NOEVALUATION="NOEVALUATION",
    INDIVIDUALEVALUATION = "INDIVIDUALEVALUATION",
    GROUPEVALUATION = "GROUPEVALUATION"
}

export enum MilestoneType{
    MILESTONEEVALUATION="MILESTONEEVALUATION",
    FINALEVALUATION = "FINALEVALUATION",    
}