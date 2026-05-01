import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ unique: true })
    email!: string

    @Column({ select: false })
    password!: string
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

    @OneToMany(() => Submission, (sub) => sub.opportunity)
    submissions!: Relation<Submission[]>
}

@Entity()
export class Submission {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text", { nullable: true })
    message!: string | null;

    @ManyToOne(() => JobOpportunity, (op) => op.submissions)
    opportunity!: Relation<JobOpportunity>

}