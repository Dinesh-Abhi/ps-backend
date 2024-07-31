export interface ReviewComment {
    comment: string;
    addedon: Date;
    givenby: string;
}

export interface studentMilestoneDetails {
    link:string,
    addedon:Date,
    comments: ReviewComment[]
}