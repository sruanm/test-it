import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

export type UsuarioRole = "tecnico" | "produtor"

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    nomeCompleto!: string

    @Column({ unique: true })
    cpf!: string

    @Column()
    municipio!: string

    @Column()
    role!: UsuarioRole

    @Column({ unique: true })
    email!: string

    @Column()
    senha!: string
}

@Entity()
export class Produtor {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column("int")
    areaTotalEmHectares!: number

    @OneToOne(() => Usuario, { nullable: false })
    @JoinColumn()
    perfil!: Relation<Usuario>
}

export type CulturaCategory = "caju" | "milho" | "feijao"

@Entity()
export class Lote {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    cultura!: CulturaCategory

    @Column("int")
    tamanhoEmHectares!: number

    @ManyToOne(() => Produtor, { nullable: false })
    dono!: Relation<Produtor>
}

export type SolicitacaoStatus = "pendente" | "aprovada" | "reprovada"
export type SolicitacaoCategory = "semente" | "fertilizante" | "kit-irrigacao"

@Entity()
export class SolicitacaoInsumo {
    @PrimaryGeneratedColumn("uuid")
    id!: string

    @Column()
    categoria!: SolicitacaoCategory

    @Column("int")
    quantidade!: number

    @Column()
    status!: SolicitacaoStatus

    @ManyToOne(() => Lote, { nullable: false })
    lote!: Relation<Lote>

    @ManyToOne(() => Usuario, { nullable: true })
    avaliadaPor!: Relation<Usuario>
}
