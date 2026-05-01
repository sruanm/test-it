import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true })
    email!: string

    @Column({ select: false })
    password!: string

    @OneToMany(() => JobOpportunity, (op) => op.publisher)
    registeredOpportunities!: Relation<JobOpportunity>

    @OneToMany(() => Submission, (sub) => sub.candidate)
    submissions!: Relation<Submission>
}

@Entity()
export class JobOpportunity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    title!: string

    @Column()
    description!: string

    @Column("float")
    renumeration!: number

    @ManyToOne(() => User, (user) => user.registeredOpportunities, { nullable: false })
    publisher!: Relation<User>

    @OneToMany(() => Submission, (sub) => sub.opportunity)
    submissions!: Relation<Submission[]>
}

@Entity()
export class Submission {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text", { nullable: true })
    message!: string | null;

    @ManyToOne(() => JobOpportunity, (op) => op.submissions, { nullable: false })
    opportunity!: Relation<JobOpportunity>

    @ManyToOne(() => User, (user) => user.submissions, { nullable: false })
    candidate!: Relation<User>
}