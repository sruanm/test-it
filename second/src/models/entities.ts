import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class User {  // Servidor
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string

    @Column({ select: false })
    password!: string

    @OneToMany(() => Book, (book) => book.registeredBy)
    registeredBooks!: Relation<Book[]>

    @OneToMany(() => Evaluation, (evaluation) => evaluation.owner)
    evaluations!: Relation<Evaluation[]>
}

export type BookGender = "fic" | "bio" | "tec" | "child"  // ficcao, biografia, tecnico, infantil

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string

    @Column()
    author!: string

    @Column()
    gender!: BookGender

    @ManyToOne(() => User, (user) => user.registeredBooks)
    registeredBy!: Relation<User>

    @OneToMany(() => Evaluation, (evaluation) => evaluation.book)
    evaluations!: Relation<Evaluation[]>
}

@Entity()
export class Evaluation {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    hasLiked!: boolean

    @Column("text", { nullable: true, default: null })
    commentary!: string | null

    @ManyToOne(() => Book, (book) => book.evaluations)
    book!: Relation<Book>;

    @ManyToOne(() => User, (user) => user.evaluations)
    owner!: Relation<User>
}